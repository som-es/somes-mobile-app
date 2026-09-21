import Ionicons from '@expo/vector-icons/Ionicons';
import { ApiError } from '@som-es/somes-ts';
import { useRouter } from 'expo-router';
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

    // go back rather than to profil, both ways in re-render signed in anyway
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profil');
    }
  }

  async function withGoogle() {
    setGooglePending(true);
    setError(null);
    const result = await signInWithProvider('google');
    setGooglePending(false);

    if (result.status === 'success') {
      await finish(result.accessToken);
    } else if (result.status === 'error') {
      setError('Anmeldung mit Google fehlgeschlagen.');
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
      setError(messageFor(error));
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
            <Text style={typography.subtitle}>Zurück</Text>
          </Pressable>

          <ScreenTitle
            title="Anmelden"
            subtitle={
              onEmailStep
                ? 'Melde dich an oder erstelle mit deiner E-Mail-Adresse ein neues Konto.'
                : 'Wir haben dir einen Code geschickt.'
            }
          />

          <Card variant="outlined" style={styles.form}>
            {onEmailStep ? (
              <>
                <TextField
                  label="E-Mail"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={submit}
                  error={error}
                  placeholder="dergertrud@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="send"
                  editable={!pending}
                />
                <Text style={typography.caption}>
                  Du brauchst kein Passwort. Wir senden dir ein einmaliges Passwort per E-Mail.
                  Hast du noch kein Konto, wird es dabei angelegt.
                </Text>
              </>
            ) : (
              <>
                <Text style={typography.body}>
                  An deine E-Mail-Adresse wurde ein One-Time Passwort gesendet.
                </Text>
                <TextField
                  label="One-Time Passwort (OTP)"
                  value={otp}
                  onChangeText={setOtp}
                  onSubmitEditing={submit}
                  error={error}
                  hint={email}
                  placeholder="MAS DS5 4DA"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  returnKeyType="send"
                  editable={!pending}
                />
                <Text style={typography.caption}>
                  Keine E-Mail erhalten? Sieh im Spam-Ordner nach. Manche Anbieter filtern sie
                  aus — dann hilft eine andere Adresse.
                </Text>
              </>
            )}

            <Button
              label={onEmailStep ? 'Code anfordern' : 'Anmelden'}
              onPress={submit}
              size="lg"
              loading={pending}
              disabled={onEmailStep ? email.trim().length === 0 : otp.trim().length === 0}
            />

            {onEmailStep ? (
              <>
                <View style={styles.divider}>
                  <View style={styles.rule} />
                  <Text style={typography.caption}>ODER</Text>
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
                        Mit Google anmelden
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
                <Text style={[typography.subtitle, styles.link]}>E-Mail ändern</Text>
              </Pressable>
            )}
          </Card>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.field === 'WrongOtp') {
      return 'Fehlerhaftes One-Time Passwort.';
    }

    const flags = signUpFlags(error);
    if (flags?.missing_email) return 'E-Mail-Adresse fehlt.';
    if (flags?.invalid_email) return 'Fehlerhafte E-Mail-Adresse.';

    if (isRateLimited(error)) {
      return 'Zu viele Versuche. Bitte warte einen Moment.';
    }
    return 'Ein serverseitiger Fehler ist aufgetreten. Es kann nicht fortgefahren werden.';
  }

  // anything that never reached the server, fetch throws rather than resolving
  return 'Keine Verbindung zum Server.';
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
