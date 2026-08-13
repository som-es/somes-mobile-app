import type { ReactElement, ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { colors } from '@/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '@/theme/layout';

type Props<T> = {
  /** The segmented control, title, search field and filter buttons. */
  header: ReactNode;
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactElement;
  isPending: boolean;
  isError: boolean;
  errorMessage: string;
  emptyMessage: string;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

export function ResultList<T>({
  header,
  items,
  keyExtractor,
  renderItem,
  isPending,
  isError,
  errorMessage,
  emptyMessage,
  onEndReached,
  isFetchingNextPage,
  refreshing,
  onRefresh,
}: Props<T>) {
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={isPending || isError ? [] : items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      style={styles.list}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + spacing.xl },
      ]}
      ListHeaderComponent={<View style={styles.header}>{header}</View>}
      ListEmptyComponent={
        isPending ? (
          <View style={styles.header}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : (
          <Notice message={isError ? errorMessage : emptyMessage} />
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={styles.footer} color={colors.chrome} />
        ) : null
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      onEndReached={onEndReached}
      // Prefetch roughly half a screen early, so the spinner rarely shows.
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.chrome}
          colors={[colors.chrome]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
