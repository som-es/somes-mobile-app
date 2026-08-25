import { Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { renew_token } from '@/api/authed';
import { isAuthError, isHasError } from '@/api/client';
import { clearToken, getToken, loadToken, setToken } from '@/lib/auth-store';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/colors';

// Rejects if the splash is already gone — e.g. on a Fast Refresh remount.
SplashScreen.preventAutoHideAsync().catch(() => {});
// The splash background is colors.chrome, so fading out reads as the header staying put.
SplashScreen.setOptions({ duration: 250, fade: true });

/** Three-day tokens, so renewing at most hourly is ample. */
const RENEW_INTERVAL = 1000 * 60 * 60;

let lastRenewedAt = 0;

/**
 * The counterpart of somes-frontend's `RenewToken.svelte`, which runs on every
 * page load and swaps the stored JWT for a fresh one.
 *
 * Tokens last three days and somes-api issues no refresh token, so `renew_token`
 * — which itself needs a still-valid token — is the only thing keeping a session
 * alive. The web gets a renewal per navigation for free; an app that sits in the
 * background for days would silently expire, so this also runs on foreground.
 *
 * Deliberately not awaited before the first render: unlike `loadToken`, nothing
 * is correct-but-stale in the meantime, and holding the splash on a network call
 * would punish a bad connection.
 */
async function renewSession() {
  if (getToken() === null) return;
  if (Date.now() - lastRenewedAt < RENEW_INTERVAL) return;
  lastRenewedAt = Date.now();

  const renewed = await renew_token();

  if (!isHasError(renewed)) {
    await setToken(renewed.access_token);
    return;
  }

  // Only an actually rejected token signs the user out. A failed fetch means the
  // phone is offline, and dropping the token there would log them out of a
  // tunnel and leave them unable to log back in.
  if (isAuthError(renewed)) {
    await clearToken();
    queryClient.clear();
  } else {
    lastRenewedAt = 0;
  }
}

export default function RootLayout() {
  /**
   * The only bundled font, and it is used for exactly one string: the "somes"
   */
  const [fontsLoaded] = useFonts({ Nunito_600SemiBold });
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    // Hydrate the JWT before anything can make an authenticated request.
    loadToken().finally(() => setTokenLoaded(true));
  }, []);

  const ready = fontsLoaded && tokenLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    renewSession();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') renewSession();
    });
    return () => subscription.remove();
  }, [ready]);

  // Keep the splash up rather than rendering chrome with a missing font.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* Android is edge-to-edge in SDK 57; the header's safe-area padding paints behind it. */}
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="anmelden" />
          <Stack.Screen name="favoriten/personen" />
          <Stack.Screen name="favoriten/abstimmungen" />
          <Stack.Screen name="abgeordnete/[id]" />
          <Stack.Screen name="abstimmung/[gp]/[ityp]/[inr]" />
          <Stack.Screen name="ministerialentwurf/[gp]/[inr]" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
