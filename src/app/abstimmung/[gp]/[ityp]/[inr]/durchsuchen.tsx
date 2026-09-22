import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NamedVoteRow } from '@/components/detail/named-vote-row';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { AppHeader } from '@/components/layout/app-header';
import { ResultList } from '@/components/lists/result-list';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { RowSkeleton } from '@/components/ui/skeleton';
import { BEHAVIOR_LABEL, VOTING_BEHAVIOR_OPTIONS, votingBehaviorOf } from '@/lib/named-vote-behavior';
import { somes } from '@/lib/somes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { RollCallVote } from '@/types';

const BEHAVIOR_VALUES = VOTING_BEHAVIOR_OPTIONS.map((option) => option.label);

export default function SearchNamedVotesScreen() {
  const { gp, ityp, inr } = useLocalSearchParams<{ gp: string; ityp: string; inr: string }>();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [parties, setParties] = useState<string[]>([]);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [partySheetOpen, setPartySheetOpen] = useState(false);
  const [behaviorSheetOpen, setBehaviorSheetOpen] = useState(false);

  // same queryKey as the vote detail screen, so this is instant when it's already
  // cached and only shows the loading state on a cold/deep-linked open
  const vote = useQuery({
    queryKey: ['vote-result', gp, ityp, inr],
    queryFn: () => somes.voteResults.byPath(gp, ityp, inr),
  });

  const activityDate = vote.data?.legislative_initiative.nr_plenary_activity_date;

  const delegates = useQuery({
    queryKey: ['delegates-at', activityDate],
    queryFn: async () => {
      const delegatesAtDate = await somes.delegates.allAtDate(activityDate!);
      return new Map(delegatesAtDate.map((delegate) => [delegate.id, delegate]));
    },
    enabled: activityDate !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
  // enabled:false leaves isPending stuck true forever, so only treat it as
  // "still loading" while a fetch is actually in flight
  const delegatesLoading = delegates.isPending && delegates.fetchStatus === 'fetching';

  const namedVotes = vote.data?.named_votes?.named_votes ?? [];

  // party options are the vote's own voters, not the whole chamber
  const partyOptions = [
    ...new Set(
      namedVotes
        .map((namedVote) => delegates.data?.get(namedVote.delegate_id)?.party)
        .filter((party): party is string => Boolean(party))
    ),
  ].sort();

  const needle = search.trim().toLowerCase();

  const filtered = namedVotes.filter((namedVote) => {
    const delegate = delegates.data?.get(namedVote.delegate_id);

    if (needle && !(delegate?.name ?? '').toLowerCase().includes(needle)) return false;
    if (parties.length > 0 && (!delegate?.party || !parties.includes(delegate.party))) {
      return false;
    }
    if (behaviors.length > 0) {
      const label = BEHAVIOR_LABEL.get(votingBehaviorOf(namedVote));
      if (!label || !behaviors.includes(label)) return false;
    }

    return true;
  });

  const header = (
    <>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={18} color={colors.text} />
        <Text style={typography.subtitle}>Zurück</Text>
      </Pressable>

      <ScreenTitle title="Durchsuchen" centered />

      <SearchField value={search} onChangeText={setSearch} placeholder="Name suchen..." />

      <View style={styles.filters}>
        <FilterPill
          label={parties.length > 0 ? `Parteien (${parties.length})` : 'Parteien'}
          onPress={() => setPartySheetOpen(true)}
        />
        <FilterPill
          label={behaviors.length > 0 ? `Verhalten (${behaviors.length})` : 'Abstimmungsverhalten'}
          onPress={() => setBehaviorSheetOpen(true)}
        />
        <FilterPill label="Herkunftsland (bald verfügbar)" disabled />
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      <ResultList
        header={header}
        items={filtered}
        keyExtractor={(item: RollCallVote) => String(item.id)}
        renderItem={(item: RollCallVote) =>
          delegatesLoading ? (
            <RowSkeleton />
          ) : (
            <NamedVoteRow vote={item} delegate={delegates.data?.get(item.delegate_id)} />
          )
        }
        isPending={vote.isPending}
        isError={vote.isError}
        errorMessage="Abstimmungen konnten nicht geladen werden."
        emptyMessage="Keine Abgeordneten gefunden"
        onEndReached={() => {}}
        isFetchingNextPage={false}
        refreshing={vote.isRefetching}
        onRefresh={() => vote.refetch()}
      />

      <MultiSelectSheet
        visible={partySheetOpen}
        title="Parteien"
        values={partyOptions}
        selected={parties}
        onChange={setParties}
        onClose={() => setPartySheetOpen(false)}
      />

      <MultiSelectSheet
        visible={behaviorSheetOpen}
        title="Abstimmungsverhalten"
        values={BEHAVIOR_VALUES}
        selected={behaviors}
        onChange={setBehaviors}
        onClose={() => setBehaviorSheetOpen(false)}
      />
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
