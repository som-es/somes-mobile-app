import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AVATAR } from '@/components/cards/delegate-card';
import { SORT_COLUMNS, toggleSort, type Sort, type SortKey } from '@/lib/delegate-sort';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Country } from '@/types';

function SortableColumn({
  label,
  sortKey,
  sort,
  onPress,
  style,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onPress: (key: SortKey) => void;
  style: ViewStyle;
}) {
  const { t } = useTranslation('delegates');
  const active = sort?.key === sortKey;

  return (
    <Pressable
      onPress={() => onPress(sortKey)}
      accessibilityRole="button"
      accessibilityLabel={t('list.sortByLabel', { label })}
      style={[styles.column, style]}>
      <Text style={typography.tableHead} numberOfLines={1}>
        {label}
      </Text>
      {active ? (
        <Ionicons
          name={sort.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={colors.textMuted}
        />
      ) : null}
    </Pressable>
  );
}

const COLUMN_STYLE: Record<SortKey, ViewStyle> = {
  name: { flex: 3 },
  partei: { flex: 2 },
  alter: { flex: 1 },
};

/** sortable name / party / age header that lines up with DelegateCard rows */
export function DelegateTableHead({
  sort,
  onSortChange,
  country,
}: {
  sort: Sort;
  onSortChange: (sort: Sort) => void;
  country: Country;
}) {
  const { t } = useTranslation('delegates');
  // EU delegate data has no reliable birthdate, so age is meaningless there
  const columns = country === 'eu' ? SORT_COLUMNS.filter((column) => column.key !== 'alter') : SORT_COLUMNS;

  return (
    <View style={styles.tableHead}>
      <View style={styles.avatarSpacer} />
      {columns.map((column) => (
        <SortableColumn
          key={column.key}
          label={t(`list.columns.${column.key}`)}
          sortKey={column.key}
          sort={sort}
          onPress={(key) => onSortChange(toggleSort(sort, key))}
          style={COLUMN_STYLE[column.key]}
        />
      ))}
      <Pressable
        onPress={() => onSortChange(null)}
        disabled={sort === null}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('list.resetSort')}
        style={({ pressed }) => [
          styles.reset,
          sort === null && styles.resetInactive,
          pressed && styles.pressed,
        ]}>
        <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.card,
  },
  avatarSpacer: { width: AVATAR },
  column: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reset: {
    width: 18,
    alignItems: 'center',
  },
  resetInactive: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.6,
  },
});
