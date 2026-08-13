import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { delegates_at, vote_result_by_path } from '@/api/api';
import { unwrap } from '@/api/client';
import { DelegateRow } from '@/components/detail/delegate-row';
import { DetailScreen, parliamentUrl } from '@/components/detail/detail-screen';
import { DocumentList, pdfDocuments } from '@/components/detail/document-list';
import { Divider, SectionCard } from '@/components/detail/section-card';
import { SpeechList } from '@/components/detail/speech-list';
import { SummaryCard } from '@/components/detail/summary-card';
import { topicNames, TopicList } from '@/components/detail/topic-list';
import { VoteBreakdown } from '@/components/detail/vote-breakdown';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { voteBadges } from '@/lib/vote-labels';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate, VoteResult } from '@/types';

export default function VoteDetailScreen() {
  const { gp, ityp, inr } = useLocalSearchParams<{ gp: string; ityp: string; inr: string }>();

  const vote = useQuery({
    queryKey: ['vote-result', gp, ityp, inr],
    queryFn: async () => unwrap(await vote_result_by_path(gp, ityp, inr)),
  });

  const activityDate = vote.data?.legislative_initiative.nr_plenary_activity_date;

  // One list of everyone sitting that day, shared by "Eingebracht von" and
  // "Reden" — both hold delegate ids and no names.
  const delegates = useQuery({
    queryKey: ['delegates-at', activityDate],
    queryFn: async () => {
      const result = unwrap(await delegates_at(activityDate!));
      return new Map(result.map((delegate) => [delegate.id, delegate]));
    },
    enabled: activityDate !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <DetailScreen sourceUrl={parliamentUrl(gp, ityp, inr)}>
      {vote.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : vote.isError ? (
        <Notice message="Abstimmung konnte nicht geladen werden." />
      ) : (
        <VoteDetail voteResult={vote.data} delegates={delegates.data ?? new Map()} />
      )}
    </DetailScreen>
  );
}

type DetailProps = {
  voteResult: VoteResult;
  delegates: Map<number, Delegate>;
};

function VoteDetail({ voteResult, delegates }: DetailProps) {
  const { legislative_initiative: initiative, ai_summary } = voteResult;

  const topics = topicNames(voteResult.eurovoc_topics, ai_summary);
  const documents = pdfDocuments(voteResult.documents);

  // The web prefixes the date line for roll-call votes and falls back to the
  // plenary date when `vote_date` is absent.
  const dateSource = initiative.vote_date ?? initiative.nr_plenary_activity_date;
  const subtitle = `${initiative.voted_by_name ? 'Namentlich abgestimmt' : 'Abstimmung'} am: ${isoToDotDate(dateSource)}`;

  return (
    <>
      <SummaryCard
        title={ai_summary?.short_title ?? initiative.description}
        subtitle={subtitle}
        summary={ai_summary?.short_summary ?? null}
        badges={voteBadges(initiative)}
        accepted={initiative.accepted === null ? null : initiative.accepted === 'a'}
      />

      {topics.length > 0 ? <TopicList topics={topics} /> : null}

      {voteResult.votes.length > 0 ? (
        <SectionCard title="Abstimmung">
          <VoteBreakdown votes={voteResult.votes} />

          {voteResult.issued_by_dels.length > 0 ? (
            <>
              <Divider />
              <Text style={[typography.cardHeading, styles.subHeading]}>Eingebracht von</Text>
              <View style={styles.issuers}>
                {voteResult.issued_by_dels.map((issuer) => {
                  const delegate = delegates.get(issuer.delegate_id);
                  return (
                    <DelegateRow
                      key={issuer.delegate_id}
                      id={issuer.delegate_id}
                      name={delegate?.name ?? 'Unbekannt'}
                      party={delegate?.party ?? null}
                      role={issuer.text}
                    />
                  );
                })}
              </View>
            </>
          ) : null}
        </SectionCard>
      ) : null}

      {voteResult.speeches.length > 0 ? (
        <SpeechList speeches={voteResult.speeches} delegates={delegates} />
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
