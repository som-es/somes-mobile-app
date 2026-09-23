import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AVATAR, DelegateCard } from '@/components/cards/delegate-card';
import { DelegateGenericSheet } from '@/components/filters/generic-sheet';
import { partiesFor, useFilterSources, withCount } from '@/components/lists/filter-sources';
import { ResultList } from '@/components/lists/result-list';
import { Chip } from '@/components/ui/chip';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import {
  compareDelegates,
  SORT_COLUMNS,
  toggleSort,
  type Sort,
  type SortKey,
} from '@/lib/delegate-sort';
import { isoToDotDate } from '@/lib/date';
import { delegateFilterCounts, emptyDelegateFilters } from '@/lib/filter-query';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useDebounced } from '@/lib/use-debounced';
import { useDelegates } from '@/lib/use-delegates';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

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

export default function AbgeordneteScreen() {
  const country = useCountry();
  return <AbgeordneteScreenContent key={country} />;
}

function AbgeordneteScreenContent() {
  const { t } = useTranslation('delegates');
  const locale = useLocale();
  const country = useCountry();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(() => emptyDelegateFilters(country));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sort, setSort] = useState<Sort>(null);

  const debouncedSearch = useDebounced(search);

  const results = useDelegates(filters, debouncedSearch);

  const { periods } = useFilterSources();
  // EU delegate data has no reliable birthdate, so age is meaningless there
  const columns = country === 'eu' ? SORT_COLUMNS.filter((column) => column.key !== 'alter') : SORT_COLUMNS;

  const parties = useQuery({
    queryKey: ['parties-per-gp'],
    queryFn: () => somes.reference.partiesPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = delegateFilterCounts(filters);
  const items = useMemo(
    () =>
      (results.data?.pages.flatMap((page) => page.delegates) ?? [])
        .slice()
        .sort(compareDelegates(sort, t)),
    [results.data, sort, t]
  );
  const updatedAt = results.data?.pages[0]?.updated_at;

  const chips = useMemo(() => partiesFor(parties.data, filters.gp), [parties.data, filters.gp]);
  const anyParty = filters.parties.length > 0;

  const toggleParty = (name: string) =>
    setFilters({
      ...filters,
      parties: filters.parties.includes(name)
        ? filters.parties.filter((selected) => selected !== name)
        : [...filters.parties, name],
    });

  const header = (
    <>
      <ScreenTitle
        title={country === 'eu' ? t('list.titleEu') : t('list.titleAt')}
        subtitle={updatedAt ? t('list.updatedAt', { date: isoToDotDate(updatedAt, locale) }) : undefined}
        centered
      />

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchField value={search} onChangeText={setSearch} />
        </View>
        <FilterPill
          label={withCount(t('list.filter'), counts.generic)}
          onPress={() => setSheetOpen(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip
          label={t('list.all')}
          color={colors.textMuted}
          dimmed={anyParty}
          onPress={() => setFilters({ ...filters, parties: [] })}
        />
        {chips.map((party) => (
          <Chip
            key={party.name}
            label={party.name}
            color={party.color ?? colors.textMuted}
            dimmed={anyParty && !filters.parties.includes(party.name)}
            onPress={() => toggleParty(party.name)}
          />
        ))}
      </ScrollView>

      <View style={styles.tableHead}>
        <View style={styles.avatarSpacer} />
        {columns.map((column) => (
          <SortableColumn
            key={column.key}
            label={t(`list.columns.${column.key}`)}
            sortKey={column.key}
            sort={sort}
            onPress={(key) => setSort(toggleSort(sort, key))}
            style={COLUMN_STYLE[column.key]}
          />
        ))}
        <Pressable
          onPress={() => setSort(null)}
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
    </>
  );

  return (
    <>
      <ResultList
        header={header}
        items={items}
        keyExtractor={(delegate) => String(delegate.id)}
        renderItem={(delegate) => <DelegateCard delegate={delegate} />}
        isPending={results.isPending}
        isError={results.isError}
        errorMessage={t('list.error')}
        emptyMessage={t('list.empty')}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) results.fetchNextPage();
        }}
        isFetchingNextPage={results.isFetchingNextPage}
        refreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
      />

      <DelegateGenericSheet
        visible={sheetOpen}
        periods={periods}
        filters={filters}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchField: {
    flex: 1,
  },
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.screen,
  },
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
