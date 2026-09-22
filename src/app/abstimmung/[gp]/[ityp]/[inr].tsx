import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DelegateRow } from '@/components/detail/delegate-row';
import { DetailScreen, parliamentUrl } from '@/components/detail/detail-screen';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { DocumentList, pdfDocuments } from '@/components/detail/document-list';
import { Divider, SectionCard } from '@/components/detail/section-card';
import { SectionLink } from '@/components/ui/section-link';
import { SpeechList } from '@/components/detail/speech-list';
import { SummaryCard } from '@/components/detail/summary-card';
import { topicNames, TopicList } from '@/components/detail/topic-list';
import { NamedVoteBreakdown, VoteBreakdown } from '@/components/detail/vote-breakdown';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton, RowSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { voteBadges } from '@/lib/vote-labels';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate, VoteResult } from '@/types';

export default function VoteDetailScreen() {
  const { t } = useTranslation('votes');
  const { gp, ityp, inr } = useLocalSearchParams<{ gp: string; ityp: string; inr: string }>();

  const vote = useQuery({
    queryKey: ['vote-result', gp, ityp, inr],
    queryFn: () => somes.voteResults.byPath(gp, ityp, inr),
  });

  const activityDate = vote.data?.legislative_initiative.nr_plenary_activity_date;

  // everyone sitting that day, used by both sections, they only hold ids
  const delegates = useQuery({
    queryKey: ['delegates-at', activityDate],
    queryFn: async () => {
      const delegatesAtDate = await somes.delegates.allAtDate(activityDate!);
      return new Map(delegatesAtDate.map((delegate) => [delegate.id, delegate]));
    },
    enabled: activityDate !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <DetailScreen
      sourceUrl={parliamentUrl(gp, ityp, inr)}
      // the bookmark is keyed on the vote result id, the route only carries gp/ityp/inr
      action={<FavoriteButton kind="vote" id={vote.data?.id ?? null} />}>
      {vote.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : vote.isError ? (
        <Notice message={t('detail.loadError')} />
      ) : (
        <VoteDetail
          voteResult={vote.data}
          delegates={delegates.data ?? new Map()}
          // enabled:false leaves isPending stuck true forever, so only treat it as
          // "still loading" while a fetch is actually in flight
          delegatesLoading={delegates.isPending && delegates.fetchStatus === 'fetching'}
          gp={gp}
          ityp={ityp}
          inr={inr}
        />
      )}
    </DetailScreen>
  );
}

type DetailProps = {
  voteResult: VoteResult;
  delegates: Map<number, Delegate>;
  delegatesLoading: boolean;
  gp: string;
  ityp: string;
  inr: string;
};

function VoteDetail({ voteResult, delegates, delegatesLoading, gp, ityp, inr }: DetailProps) {
  const { t } = useTranslation('votes');
  const locale = useLocale();
  const router = useRouter();
  const country = useCountry();
  const { legislative_initiative: initiative, ai_summary } = voteResult;

  const topics = topicNames(voteResult.eurovoc_topics, ai_summary);
  const documents = pdfDocuments(voteResult.documents);

  // the web prefixes the date line for roll call votes and falls back to the plenary date
  const dateSource = initiative.vote_date ?? initiative.nr_plenary_activity_date;
  const subtitle = initiative.voted_by_name
    ? t('detail.namedVoteSubtitle', { date: isoToDotDate(dateSource, locale) })
    : t('detail.voteSubtitle', { date: isoToDotDate(dateSource, locale) });

  return (
    <>
      <SummaryCard
        title={ai_summary?.short_title ?? initiative.description}
        subtitle={subtitle}
        summary={ai_summary?.short_summary ?? null}
        aiGenerated={ai_summary?.short_summary != null}
        badges={voteBadges(t, locale, initiative)}
        // EU acceptance data isn't ready to surface yet
        accepted={
          country === 'eu' || initiative.accepted === null ? null : initiative.accepted === 'a'
        }
      />

      {topics.length > 0 ? <TopicList topics={topics} /> : null}

      {voteResult.votes.length > 0 || voteResult.named_votes ? (
        <SectionCard
          title={t('detail.votingHeading')}
          action={
            country === 'eu' && voteResult.named_votes ? (
              <SectionLink
                label={t('detail.search')}
                onPress={() =>
                  router.push({
                    pathname: '/abstimmung/[gp]/[ityp]/[inr]/durchsuchen',
                    params: { gp, ityp, inr },
                  })
                }
              />
            ) : undefined
          }>
          {voteResult.votes.length > 0 ? <VoteBreakdown votes={voteResult.votes} /> : null}
          {voteResult.votes.length > 0 && voteResult.named_votes ? <Divider /> : null}
          {voteResult.named_votes ? (
            <NamedVoteBreakdown info={voteResult.named_votes.named_vote_info} />
          ) : null}

          {voteResult.issued_by_dels.length > 0 ? (
            <>
              <Divider />
              <Text style={[typography.cardHeading, styles.subHeading]}>{t('detail.broughtBy')}</Text>
              <View style={styles.issuers}>
                {delegatesLoading
                  ? voteResult.issued_by_dels.map((issuer) => (
                      <RowSkeleton key={issuer.delegate_id} />
                    ))
                  : voteResult.issued_by_dels.map((issuer) => {
                      const delegate = delegates.get(issuer.delegate_id);
                      return (
                        <DelegateRow
                          key={issuer.delegate_id}
                          id={issuer.delegate_id}
                          name={delegate?.name ?? t('common:detail.unknownDelegate')}
                          party={delegate?.party ?? null}
                          role={issuer.text}
                          imageUrl={delegate?.image_url ?? null}
                        />
                      );
                    })}
              </View>
            </>
          ) : null}
        </SectionCard>
      ) : null}

      {voteResult.speeches.length > 0 ? (
        <SpeechList speeches={voteResult.speeches} delegates={delegates} gp={gp} ityp={ityp} inr={inr} />
      ) : null}

      {documents.length > 0 ? <DocumentList documents={documents} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  subHeading: {
    marginBottom: spacing.md,
  },
  issuers: {
    gap: spacing.md,
  },
});
