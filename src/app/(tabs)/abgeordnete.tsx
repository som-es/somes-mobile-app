import Ionicons from '@expo/vector-icons/Ionicons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';

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
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** the web asks for 50 at a time, a phone shows far fewer per screen */
const ENTRIES_PER_PAGE = 25;

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
  const active = sort?.key === sortKey;

  return (
    <Pressable
      onPress={() => onPress(sortKey)}
      accessibilityRole="button"
      accessibilityLabel={`Nach ${label} sortieren`}
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
  const country = useCountry();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(() => emptyDelegateFilters(country));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sort, setSort] = useState<Sort>(null);

  const debouncedSearch = useDebounced(search);

  const results = useInfiniteQuery({
    // the filter object is part of the key, react-query hashes it stably
    queryKey: ['delegates', filters, debouncedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.delegates.search({
        page: pageParam,
        entriesPerPage: ENTRIES_PER_PAGE,
        name: debouncedSearch || null,
        legisPeriods: filters.gp ? [filters.gp] : [],
        parties: filters.parties,
        onlyGovernment: filters.onlyGov,
        includePreviousPartyMembership: filters.mindPreviousPartyMembership,
        hasActiveMandate: filters.hasActiveMandate,
      }),
    getNextPageParam: (last, pages) =>
      pages.length < last.max_page ? pages.length + 1 : undefined,
  });

  const { periods } = useFilterSources();
  // EU delegate data has no reliable birthdate, so age is meaningless there
  const columns = country === 'eu' ? SORT_COLUMNS.filter((column) => column.key !== 'alter') : SORT_COLUMNS;

  const parties = useQuery({
    queryKey: ['parties-per-gp'],
    queryFn: () => somes.reference.partiesPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = delegateFilterCounts(filters);
  const items = (results.data?.pages.flatMap((page) => page.delegates) ?? [])
    .slice()
    .sort(compareDelegates(sort));
  const updatedAt = results.data?.pages[0]?.updated_at;

  const chips = partiesFor(parties.data, filters.gp);
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
        title={country === 'eu' ? 'Mitglieder des Europäischen Parlaments' : 'Abgeordnete des Nationalrats'}
        subtitle={updatedAt ? `Aktualisiert am ${isoToDotDate(updatedAt)}` : undefined}
        centered
      />

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchField value={search} onChangeText={setSearch} />
        </View>
        <FilterPill
          label={withCount('Filter', counts.generic)}
          onPress={() => setSheetOpen(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip
          label="Alle"
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
            label={column.label}
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
          accessibilityLabel="Sortierung zurücksetzen"
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
        errorMessage="Abgeordnete konnten nicht geladen werden."
        emptyMessage="Keine Abgeordneten gefunden"
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
