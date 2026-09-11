import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

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

export function DetailScreen({
  sourceUrl,
  sourceLabel = 'Auf parlament.gv.at öffnen',
  action,
  children,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
            <Text style={typography.subtitle}>Zurück</Text>
          </Pressable>

          <View style={styles.actions}>
            {action}
            {sourceUrl ? (
              <Pressable
                onPress={() => Linking.openURL(sourceUrl)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={sourceLabel}>
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

/** utm_source matches what somes.at appends to the same link */
export function parliamentUrl(gp: string, ityp: string, inr: string | number): string {
  return `https://parlament.gv.at/gegenstand/${gp}/${ityp}/${inr}?utm_source=somes.at`;
}

/** a person has their own shape of parliament url, no gp/ityp/inr */
export function personUrl(id: string | number): string {
  return `https://parlament.gv.at/person/${id}?utm_source=somes.at`;
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
