import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { delegates_search_persons, parties_per_gp } from '@/api/api';
import { unwrap } from '@/api/client';
import { AVATAR, DelegateCard } from '@/components/cards/delegate-card';
import { DelegateGenericSheet } from '@/components/filters/generic-sheet';
import { partiesFor, useFilterSources, withCount } from '@/components/lists/filter-sources';
import { ResultList } from '@/components/lists/result-list';
import { Chip } from '@/components/ui/chip';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { isoToDotDate } from '@/lib/date';
import { delegateFilterCounts, emptyDelegateFilters } from '@/lib/filter-query';
import { useDebounced } from '@/lib/use-debounced';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** The web asks for 50 at a time; a phone shows a fraction of that per screen. */
const ENTRIES_PER_PAGE = 25;

export default function AbgeordneteScreen() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyDelegateFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounced(search);

  const results = useInfiniteQuery({
    // The filter object is part of the key; react-query hashes it stably.
    queryKey: ['delegates', filters, debouncedSearch],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await delegates_search_persons(
          pageParam,
          ENTRIES_PER_PAGE,
          debouncedSearch || null,
          filters.gp ? [filters.gp] : [],
          filters.parties,
          filters.onlyGov,
          filters.mindPreviousPartyMembership,
          filters.hasActiveMandate
        )
      ),
    getNextPageParam: (last, pages) =>
      pages.length < last.max_page ? pages.length + 1 : undefined,
  });

  const { periods } = useFilterSources();

  const parties = useQuery({
    queryKey: ['parties-per-gp'],
    queryFn: async () => unwrap(await parties_per_gp()),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = delegateFilterCounts(filters);
  const items = results.data?.pages.flatMap((page) => page.delegates) ?? [];
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
        title="Abgeordnete des Nationalrats"
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
        <Text style={[typography.tableHead, styles.nameCol]}>Name</Text>
        <Text style={[typography.tableHead, styles.partyCol]}>Partei</Text>
        <Text style={[typography.tableHead, styles.ageCol]}>Alter</Text>
        <View style={styles.chevronSpacer} />
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
  chevronSpacer: { width: 18 },
  nameCol: { flex: 3 },
  partyCol: { flex: 2 },
  ageCol: { flex: 1 },
});
