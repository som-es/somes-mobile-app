import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProposalCard } from '@/components/cards/proposal-card';
import { VoteResultCard } from '@/components/cards/vote-result-card';
import { NextSessionCard } from '@/components/home/next-session-card';
import { Notice } from '@/components/ui/notice';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { SectionLink } from '@/components/ui/section-link';
import { CardSkeleton } from '@/components/ui/skeleton';
import { requestAbstimmungenTab } from '@/lib/abstimmungen-tab';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { spacing } from '@/theme/layout';

const LATEST_COUNT = 3;
const PROPOSAL_DAYS = 30;

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const router = useRouter();
  const country = useCountry();
  const locale = useLocale();

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
    // MEPs have no government concept, the endpoint always answers empty for eu
    enabled: country === 'at',
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
      {session.isPending ? (
        <CardSkeleton />
      ) : (
        <NextSessionCard
          date={session.data?.date_and_time ?? null}
          title={country === 'eu' ? t('session.titleEu') : t('session.titleAt')}
        />
      )}

      <View style={styles.section}>
        <ScreenTitle
          title={t('votes.title')}
          subtitle={voteDate ? t('votes.votedOn', { date: isoToDotDate(voteDate, locale) }) : undefined}
          section
        />

        {votes.isPending ? (
          <Skeletons />
        ) : votes.isError ? (
          <Notice message={t('votes.error')} />
        ) : votes.data.length === 0 ? (
          <Notice message={t('votes.empty')} />
        ) : (
          votes.data
            .slice(0, LATEST_COUNT)
            .map((voteResult) => (
              <VoteResultCard key={voteResult.id} voteResult={voteResult} />
            ))
        )}

        <SectionLink
          label={t('votes.more')}
          onPress={() => {
            requestAbstimmungenTab('nationalrat');
            router.navigate('/abstimmungen');
          }}
        />
      </View>

      {country === 'at' && (
        <View style={styles.section}>
          <ScreenTitle title={t('proposals.title')} subtitle={t('proposals.subtitle')} section />

          {proposals.isPending ? (
            <Skeletons />
          ) : proposals.isError ? (
            <Notice message={t('proposals.error')} />
          ) : proposals.data.length === 0 ? (
            <Notice message={t('proposals.empty')} />
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
            label={t('proposals.more')}
            onPress={() => {
              requestAbstimmungenTab('regierung');
              router.navigate('/abstimmungen');
            }}
          />
        </View>
      )}
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
