import Ionicons from '@expo/vector-icons/Ionicons';
import { ApiError } from '@som-es/somes-ts';
import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { signInWithProvider } from '@/lib/oauth';
import { isRateLimited, signUpFlags, somes } from '@/lib/somes';
import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Step = 'email' | 'otp';

export default function AnmeldenScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const { signIn } = useSession();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function finish(accessToken: string) {
    await signIn(accessToken);

    // dismissTo rather than back(): the google flow can race with the
    // somesmobileapp://resolve_token deep link also landing on the stack (its
    // own screen replaces itself with /profil first), so a plain back() can
    // pop that fresh /profil straight back to anmelden. dismissTo always
    // settles on /profil regardless of how many screens ended up on top
    router.dismissTo('/profil');
  }

  async function withGoogle() {
    setGooglePending(true);
    setError(null);
    const result = await signInWithProvider('google');
    setGooglePending(false);

    if (result.status === 'success') {
      await finish(result.accessToken);
    } else if (result.status === 'error') {
      setError(t('errors.google'));
    }
    // cancelled is the user backing out, not an error worth showing
  }

  async function submit() {
    setPending(true);
    setError(null);

    let accessToken: string;
    try {
      if (step === 'email') {
        // the server mails the code and waits for it, there is nothing to hand back
        await somes.auth.requestOtp(email.trim());
        setStep('otp');
        return;
      }
      accessToken = await somes.auth.login(email.trim(), otp);
    } catch (error) {
      setError(messageFor(error, t));
      return;
    } finally {
      setPending(false);
    }

    // outside the catch, a failed navigation is not a login error
    await finish(accessToken);
  }

  const onEmailStep = step === 'email';

  return (
    <View style={styles.root}>
      <AppHeader />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen tabBarSpacing={false}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
            <Text style={typography.subtitle}>{t('common:actions.back')}</Text>
          </Pressable>

          <ScreenTitle
            title={t('signIn.title')}
            subtitle={onEmailStep ? t('signIn.subtitleEmail') : t('signIn.subtitleOtp')}
          />

          <Card variant="outlined" style={styles.form}>
            {onEmailStep ? (
              <>
                <TextField
                  label={t('signIn.emailLabel')}
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={submit}
                  error={error}
                  placeholder={t('signIn.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  editable={!pending}
                />
                <Text style={typography.caption}>{t('signIn.emailHint')}</Text>
              </>
            ) : (
              <>
                <Text style={typography.body}>{t('signIn.otpSentNotice')}</Text>
                <TextField
                  label={t('signIn.otpLabel')}
                  value={otp}
                  onChangeText={setOtp}
                  onSubmitEditing={submit}
                  error={error}
                  hint={email}
                  placeholder={t('signIn.otpPlaceholder')}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  returnKeyType="send"
                  editable={!pending}
                />
                <Text style={typography.caption}>{t('signIn.otpHint')}</Text>
              </>
            )}

            <Button
              label={onEmailStep ? t('signIn.requestCode') : t('signIn.submit')}
              onPress={submit}
              size="lg"
              loading={pending}
              disabled={onEmailStep ? email.trim().length === 0 : otp.trim().length === 0}
            />

            {onEmailStep ? (
              <>
                <View style={styles.divider}>
                  <View style={styles.rule} />
                  <Text style={typography.caption}>{t('signIn.or')}</Text>
                  <View style={styles.rule} />
                </View>

                <Pressable
                  onPress={withGoogle}
                  disabled={googlePending || pending}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.google,
                    (googlePending || pending) && styles.inert,
                    pressed && styles.pressedButton,
                  ]}>
                  {googlePending ? (
                    <ActivityIndicator size="small" color={colors.textTitle} />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={18} color={colors.textTitle} />
                      <Text style={[typography.button, styles.googleLabel]}>
                        {t('signIn.googleSignIn')}
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={() => {
                  setStep('email');
                  setOtp('');
                  setError(null);
                }}
                hitSlop={8}
                accessibilityRole="button">
                <Text style={[typography.subtitle, styles.link]}>{t('signIn.changeEmail')}</Text>
              </Pressable>
            )}
          </Card>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

function messageFor(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    if (error.field === 'WrongOtp') {
      return t('errors.wrongOtp');
    }

    const flags = signUpFlags(error);
    if (flags?.missing_email) return t('errors.missingEmail');
    if (flags?.invalid_email) return t('errors.invalidEmail');

    if (isRateLimited(error)) {
      return t('errors.rateLimited');
    }
    return t('errors.server');
  }

  // anything that never reached the server, fetch throws rather than resolving
  return t('errors.network');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  fill: {
    flex: 1,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  link: {
    color: colors.accent,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardRaised,
  },
  googleLabel: {
    color: colors.textTitle,
    fontWeight: '600',
  },
  inert: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
