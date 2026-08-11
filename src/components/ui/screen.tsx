import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '@/theme/layout';
import { typography } from '@/theme/typography';

type ScreenProps = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. a FlatList). */
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  /**
   * The tab bar paints TAB_BAR_HEIGHT *plus* the bottom inset, so content has
   * to clear both. Missing the inset hid the last ~34pt of every screen behind
   * the bar on any device with a home indicator.
   */
  const paddingBottom = TAB_BAR_HEIGHT + insets.bottom + spacing.xl;

  if (!scroll) {
    return <View style={[styles.screen, { paddingBottom }]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
      // The custom header already owns the top inset.
      contentInsetAdjustmentBehavior="never"
      // Both search screens would otherwise swallow the first tap on a result
      // while the keyboard is up.
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

type TitleProps = {
  title: string;
  subtitle?: string;
  /** The design centres screen titles but left-aligns section titles. */
  centered?: boolean;
  section?: boolean;
};

/** Title plus the muted line beneath it — the pattern on every screen. */
export function ScreenTitle({ title, subtitle, centered = false, section = false }: TitleProps) {
  return (
    <View style={[styles.titleBlock, centered && styles.centered]}>
      <Text style={section ? typography.sectionTitle : typography.screenTitle}>{title}</Text>
      {subtitle ? <Text style={typography.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  centered: {
    alignItems: 'center',
  },
});
