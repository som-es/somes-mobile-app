import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

/**
 * A pushed screen that is not a detail record: header, a "Zurück" row, content.
 *
 * `DetailScreen` is the same shape but demands a `sourceUrl`, because everything
 * it wraps came from parlament.gv.at. These screens show the user's own data,
 * which has no source link.
 */
export function SubScreen({ children, refreshing, onRefresh }: Props) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen refreshing={refreshing} onRefresh={onRefresh}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={typography.subtitle}>Zurück</Text>
        </Pressable>

        {children}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
