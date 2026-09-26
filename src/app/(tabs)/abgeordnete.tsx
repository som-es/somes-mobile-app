import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DelegateCard } from '@/components/cards/delegate-card';
import { DelegateGenericSheet } from '@/components/filters/generic-sheet';
import { DelegateTableHead } from '@/components/lists/delegate-table-head';
import {
  NO_CLUB_PARTY,
  partiesFor,
  useFilterSources,
  withCount,
} from '@/components/lists/filter-sources';
import { ResultList } from '@/components/lists/result-list';
import { Chip } from '@/components/ui/chip';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { compareDelegates, type Sort } from '@/lib/delegate-sort';
import { isoToDotDate } from '@/lib/date';
import { delegateFilterCounts, emptyDelegateFilters } from '@/lib/filter-query';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useDebounced } from '@/lib/use-debounced';
import { useDelegates } from '@/lib/use-delegates';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';

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

  const results = useDelegates(filters, debouncedSearch, sort !== null);

  const { periods } = useFilterSources();

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

  const chips = useMemo(
    () => partiesFor(parties.data, filters.gp, country),
    [parties.data, filters.gp, country]
  );
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
            label={
              party.name.toUpperCase() === NO_CLUB_PARTY[country].toUpperCase()
                ? t('card.withoutClub')
                : party.name
            }
            color={party.color ?? colors.textMuted}
            dimmed={anyParty && !filters.parties.includes(party.name)}
            onPress={() => toggleParty(party.name)}
          />
        ))}
      </ScrollView>

      <DelegateTableHead sort={sort} onSortChange={setSort} country={country} />
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
});
