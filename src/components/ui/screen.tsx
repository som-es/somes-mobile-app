import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '@/theme/layout';
import { typography } from '@/theme/typography';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, scroll = true, refreshing, onRefresh }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = TAB_BAR_HEIGHT + insets.bottom + spacing.xl;

  if (!scroll) {
    return <View style={[styles.screen, { paddingBottom }]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.chrome}
            colors={[colors.chrome]}
          />
        ) : undefined
      }>
      {children}
    </ScrollView>
  );
}

type TitleProps = {
  title: string;
  subtitle?: string;
  centered?: boolean;
  section?: boolean;
};

export function ScreenTitle({ title, subtitle, centered = false, section = false }: TitleProps) {
  return (
    <View style={[styles.titleBlock, centered && styles.centered]}>
      <Text
        style={[
          section ? typography.sectionTitle : typography.screenTitle,
          centered && styles.centeredText,
        ]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[typography.subtitle, centered && styles.centeredText]}>{subtitle}</Text>
      ) : null}
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
  centeredText: {
    textAlign: 'center',
  },
});
