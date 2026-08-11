import { Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { loadToken } from '@/lib/auth-store';
import { queryClient } from '@/lib/query-client';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

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
          <Stack.Screen name="abgeordnete/[id]" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
