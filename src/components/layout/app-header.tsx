import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SomesMark } from '@/assets/somes-mark';
import { CountrySheet } from '@/components/layout/country-sheet';
import { CountryFlag } from '@/components/ui/country-flag';
import { useCountry, useSwitchCountry } from '@/lib/use-country';
import { colors, shadows } from '@/theme/colors';
import { HEADER_HEIGHT, radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export function AppHeader() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const country = useCountry();
  // the header renders on the notifications screen too, so the bell has to stop
  // offering the screen it is already showing
  const onNotifications = pathname === '/notifications';
  // same reasoning for the info button and the impressum screen it renders on
  const onImpressum = pathname === '/impressum';
  const switchCountry = useSwitchCountry();
  const [showCountrySheet, setShowCountrySheet] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.navigate('/')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common:appHeader.home')}
          style={({ pressed }) => [styles.logo, pressed && styles.pressed]}>
          <SomesMark size={34} color={colors.onChrome} />
          <Text style={[typography.logo, styles.wordmark]}>somes</Text>
        </Pressable>

        <View style={styles.actions}>

          <Pressable
            onPress={() => setShowCountrySheet(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('common:appHeader.regionSwitch', {
              region: t(`common:country.${country}.title`),
            })}
            style={({ pressed }) => [styles.flag, pressed && styles.pressed]}>
            <CountryFlag country={country} size={28} variant='map' color='#fff' />
          </Pressable>
        </View>
      </View>

      <CountrySheet
        visible={showCountrySheet}
        value={country}
        onChange={async (next) => {
          if (pathname !== '/profil') router.navigate('/');
          await switchCountry(next);
        }}
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
  info: {
    padding: spacing.xs,
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
