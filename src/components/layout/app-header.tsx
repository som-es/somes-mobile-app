import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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

type Props = {
  hasUnread?: boolean;
};

export function AppHeader({ hasUnread = false }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const country = useCountry();
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

          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Benachrichtigungen"
            style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
            <Ionicons
              name={hasUnread ? 'notifications' : 'notifications-outline'}
              size={22}
              color={colors.onChrome}
            />
            {hasUnread ? <View style={styles.dot} /> : null}
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
  dot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});
