import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '@/theme/layout';
import { typography } from '@/theme/typography';

type ScreenProps = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. a FlatList). */
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
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
    paddingBottom: TAB_BAR_HEIGHT + spacing.xl,
    gap: spacing.lg,
  },
  titleBlock: {
    gap: spacing.xs / 2,
  },
  centered: {
    alignItems: 'center',
  },
});
