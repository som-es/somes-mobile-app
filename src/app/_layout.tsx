import { Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// side-effect import: initializes the shared i18next instance before loadLocale
// (and anything else) can read or change i18n.language
import '@/i18n';
import { PushRegistrar } from '@/components/push-registrar';
import { PushRouter } from '@/components/push-router';
import { loadLocale } from '@/lib/locale';
import { queryClient } from '@/lib/query-client';
import { clearToken, getToken, isAuthError, loadCountry, loadToken, somes } from '@/lib/somes';
import { colors } from '@/theme/colors';

// rejects if the splash is already gone, e.g. on a fast refresh remount
SplashScreen.preventAutoHideAsync().catch(() => {});
// the splash background is colors.chrome, so fading out looks like the header staying put
SplashScreen.setOptions({ duration: 250, fade: true });

/** three day tokens, so renewing once an hour is plenty */
const RENEW_INTERVAL = 1000 * 60 * 60;

let lastRenewedAt = 0;

async function renewSession() {
  if (getToken() === null) return;
  if (Date.now() - lastRenewedAt < RENEW_INTERVAL) return;
  lastRenewedAt = Date.now();

  try {
    // the library stores the renewed token itself
    await somes.auth.renewToken();
  } catch (error) {
    // only a rejected token signs the user out, a failed fetch just means offline
    if (isAuthError(error)) {
      await clearToken();
      queryClient.clear();
    } else {
      lastRenewedAt = 0;
    }
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Nunito_600SemiBold });
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const [countryLoaded, setCountryLoaded] = useState(false);
  const [localeLoaded, setLocaleLoaded] = useState(false);

  useEffect(() => {
    // load the jwt before anything can make an authenticated request
    loadToken().finally(() => setTokenLoaded(true));
    // load the region before the first request, so it doesn't fire against
    // the default country and then have to be redone against the stored one
    loadCountry().finally(() => setCountryLoaded(true));
    // load the locale before the first frame renders, so it never flashes the
    // i18next default (en-GB) before switching to a stored/detected German pick
    loadLocale().finally(() => setLocaleLoaded(true));
  }, []);

  const ready = fontsLoaded && tokenLoaded && countryLoaded && localeLoaded;

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

  // keep the splash up rather than showing chrome with a missing font
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* android is edge to edge in sdk 57, the header safe area padding paints behind it */}
        <StatusBar style="light" />
        <PushRegistrar />
        <PushRouter />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="impressum" />
          <Stack.Screen name="anmelden" />
          <Stack.Screen name="resolve_token" />
          <Stack.Screen name="favoriten/personen" />
          <Stack.Screen name="favoriten/abstimmungen" />
          <Stack.Screen name="abgeordnete/[id]" />
          <Stack.Screen name="frage/[id]" />
          <Stack.Screen name="frage/neu" />
          <Stack.Screen name="abstimmung/[gp]/[ityp]/[inr]" />
          <Stack.Screen name="abstimmung/[gp]/[ityp]/[inr]/reden" />
          <Stack.Screen name="abstimmung/[gp]/[ityp]/[inr]/durchsuchen" />
          <Stack.Screen name="ministerialentwurf/[gp]/[inr]" />
          <Stack.Screen name="verordnung/[risId]" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
