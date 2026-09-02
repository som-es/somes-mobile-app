import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ProposalCard } from '@/components/cards/proposal-card';
import { VoteResultCard } from '@/components/cards/vote-result-card';
import { NextSessionCard } from '@/components/home/next-session-card';
import { Notice } from '@/components/ui/notice';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { SectionLink } from '@/components/ui/section-link';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { spacing } from '@/theme/layout';

const LATEST_COUNT = 3;
const PROPOSAL_DAYS = 30;

export default function HomeScreen() {
  const router = useRouter();

  const session = useQuery({
    queryKey: ['next-plenar-date'],
    queryFn: () => somes.reference.nextPlenarDate(),
  });

  const votes = useQuery({
    queryKey: ['latest-vote-results'],
    queryFn: () => somes.voteResults.latest(),
  });

  const proposals = useQuery({
    queryKey: ['latest-proposals', PROPOSAL_DAYS],
    queryFn: () => somes.govProposals.latest(PROPOSAL_DAYS),
  });

  const refreshing = session.isRefetching || votes.isRefetching || proposals.isRefetching;
  const onRefresh = () => {
    session.refetch();
    votes.refetch();
    proposals.refetch();
  };

  // the web takes the section's date from the first result, not from today
  const voteDate = votes.data?.at(0)?.legislative_initiative.nr_plenary_activity_date;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <NextSessionCard date={session.data?.date_and_time ?? null} />

      <View style={styles.section}>
        <ScreenTitle
          title="Letzte Abstimmungen"
          subtitle={voteDate ? `Abgestimmt am ${isoToDotDate(voteDate)}` : undefined}
          section
        />

        {votes.isPending ? (
          <Skeletons />
        ) : votes.isError ? (
          <Notice message="Abstimmungen konnten nicht geladen werden." />
        ) : votes.data.length === 0 ? (
          <Notice message="Keine." />
        ) : (
          votes.data
            .slice(0, LATEST_COUNT)
            .map((voteResult) => (
              <VoteResultCard key={voteResult.id} voteResult={voteResult} />
            ))
        )}

        <SectionLink
          label="Weitere Abstimmungen"
          onPress={() => router.navigate('/abstimmungen')}
        />
      </View>

      <View style={styles.section}>
        <ScreenTitle title="Ministerialentwürfe" subtitle="Der letzten 30 Tage" section />

        {proposals.isPending ? (
          <Skeletons />
        ) : proposals.isError ? (
          <Notice message="Ministerialentwürfe konnten nicht geladen werden." />
        ) : proposals.data.length === 0 ? (
          <Notice message="Keine." />
        ) : (
          proposals.data
            .slice(0, LATEST_COUNT)
            .map((proposal) => (
              <ProposalCard
                key={proposal.gov_proposal.ministrial_proposal.id}
                proposal={proposal}
              />
            ))
        )}

        <SectionLink
          label="Weitere Ministerialentwürfe"
          onPress={() => router.navigate('/abstimmungen')}
        />
      </View>
    </Screen>
  );
}

function Skeletons() {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
});
