import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/app-header';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Country } from '@/types';

type Props = {
  /** optional because a decree only carries its link once the fetch resolves, and
      may not have one at all, unlike the parlament.gv.at url the other screens build
      from their route params */
  sourceUrl?: string;
  /** naming the destination is the useful part of the label, and a decree is the one
      source that is not parliament */
  sourceLabel?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function DetailScreen({ sourceUrl, sourceLabel, action, children }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen tabBarSpacing={false}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
            <Text style={typography.subtitle}>{t('common:detail.back')}</Text>
          </Pressable>

          <View style={styles.actions}>
            {action}
            {sourceUrl ? (
              <Pressable
                onPress={() => Linking.openURL(sourceUrl)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={sourceLabel ?? t('common:detail.openOnParliament')}>
                <Ionicons name="open-outline" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {children}
      </Screen>
    </View>
  );
}

/** utm_source matches what somes.at appends to the same link; EU has no
    gegenstand page, so its inr - a year and a running number encoded
    together, e.g. 20262876 - gets split back apart for oeil's own
    procedure-file reference format instead */
export function parliamentUrl(
  country: Country,
  gp: string,
  ityp: string,
  inr: string | number
): string {
  if (country === 'eu') {
    const digits = String(inr);
    const year = digits.slice(0, 4);
    const nr = digits.slice(4);
    return `https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=${year}/${nr}(${ityp})&utm_source=somes.at`;
  }
  return `https://parlament.gv.at/gegenstand/${gp}/${ityp}/${inr}?utm_source=somes.at`;
}

/** a person has their own shape of parliament url, no gp/ityp/inr */
export function personUrl(country: Country, id: string | number): string {
  return country === 'eu'
    ? `https://www.europarl.europa.eu/meps/en/${id}?utm_source=somes.at`
    : `https://parlament.gv.at/person/${id}?utm_source=somes.at`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
