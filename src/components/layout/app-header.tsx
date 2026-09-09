import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SomesMark } from '@/assets/somes-mark';
import { CountrySheet } from '@/components/layout/country-sheet';
import { CountryFlag } from '@/components/ui/country-flag';
import { useCountry, useSwitchCountry } from '@/lib/use-country';
import { colors, shadows } from '@/theme/colors';
import { HEADER_HEIGHT, radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Country } from '@/types';

const COUNTRY_LABEL: Record<Country, string> = {
  at: 'Österreich',
  eu: 'Europäische Union',
};

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const country = useCountry();
  // the header renders on the notifications screen too, so the bell has to stop
  // offering the screen it is already showing
  const onNotifications = pathname === '/notifications';
  const switchCountry = useSwitchCountry();
  const [showCountrySheet, setShowCountrySheet] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.navigate('/')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="somes — zur Startseite"
          style={({ pressed }) => [styles.logo, pressed && styles.pressed]}>
          <SomesMark size={34} color={colors.onChrome} />
          <Text style={[typography.logo, styles.wordmark]}>somes</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setShowCountrySheet(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Region wechseln, aktuell ${COUNTRY_LABEL[country]}`}
            style={({ pressed }) => [styles.flag, pressed && styles.pressed]}>
            <CountryFlag country={country} size={22} />
          </Pressable>

          {/* navigate, not push: a NAVIGATE action reuses the route when it is already
              on top, so a second tap that lands before the guard below re-renders
              cannot stack a duplicate screen. push never dedupes. */}
          <Pressable
            onPress={() => router.navigate('/notifications')}
            disabled={onNotifications}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Benachrichtigungen"
            accessibilityState={{ selected: onNotifications, disabled: onNotifications }}
            style={({ pressed }) => [
              styles.bell,
              onNotifications && styles.inactive,
              pressed && styles.pressed,
            ]}>
            <Ionicons
              name={onNotifications ? 'notifications' : 'notifications-outline'}
              size={22}
              color={colors.onChrome}
            />
          </Pressable>
        </View>
      </View>

      <CountrySheet
        visible={showCountrySheet}
        value={country}
        onChange={switchCountry}
        onClose={() => setShowCountrySheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.chrome,
    ...shadows.header,
    zIndex: 10,
  },
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  wordmark: {
    includeFontPadding: false,
    transform: [{ translateY: -3 }],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flag: {
    padding: spacing.xs,
    borderRadius: radius.thumb,
    overflow: 'hidden',
  },
  bell: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  /** same dimming as a disabled SettingRow, so the bell reads as the screen you are
      already on rather than as something still worth tapping */
  inactive: {
    opacity: 0.45,
  },
});
