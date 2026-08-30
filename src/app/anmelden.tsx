import Ionicons from '@expo/vector-icons/Ionicons';
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

import { login } from '@/api/authed';
import { isHasError, signUpFlags } from '@/api/client';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { signInWithProvider } from '@/lib/oauth';
import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { HasError } from '@/types';

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

    // Back rather than forward-to-Profil: both entry points re-render signed in.
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
    // 'cancelled' is the user backing out — not an error worth reporting.
  }

  async function submit() {
    setPending(true);
    setError(null);

    // Step 1 sends '' rather than null on purpose — see `login()`.
    const result = await login(email.trim(), step === 'email' ? '' : otp, false);
    setPending(false);

    if (isHasError(result)) {
      setError(messageFor(result));
      return;
    }

    // An empty token means the code was mailed and the server is waiting for it.
    if (result.access_token.length === 0) {
      setStep('otp');
      return;
    }

    await finish(result.access_token);
  }

  const onEmailStep = step === 'email';

  return (
    <View style={styles.root}>
      <AppHeader />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Screen>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
            <Text style={typography.subtitle}>Zurück</Text>
          </Pressable>

          <ScreenTitle
            title="Anmelden"
            subtitle={
              onEmailStep
                ? 'Willkommen zurück. Gib deine E-Mail-Adresse ein.'
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

function messageFor(result: HasError): string {
  if (result.field === 'WrongOtp') {
    return 'Fehlerhaftes One-Time Passwort.';
  }

  const flags = signUpFlags(result);
  if (flags?.missing_email) return 'E-Mail-Adresse fehlt.';
  // Typo in somes-frontend's copy ("Felerhafte"), corrected here.
  if (flags?.invalid_email) return 'Fehlerhafte E-Mail-Adresse.';

  if (result.error_type === 'RateLimit') {
    return 'Zu viele Versuche. Bitte warte einen Moment.';
  }
  if (result.error_type === 'FetchError') {
    return 'Keine Verbindung zum Server.';
  }
  return 'Ein serverseitiger Fehler ist aufgetreten. Es kann nicht fortgefahren werden.';
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
  /** White with a hairline, as on somes.at — Google's mark needs a light field. */
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
