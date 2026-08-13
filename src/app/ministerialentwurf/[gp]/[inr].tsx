import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { gov_proposal_by_path } from '@/api/api';
import { unwrap } from '@/api/client';
import { VoteResultCard } from '@/components/cards/vote-result-card';
import { DelegateRow } from '@/components/detail/delegate-row';
import { DetailScreen, parliamentUrl } from '@/components/detail/detail-screen';
import { DocumentList, pdfDocuments } from '@/components/detail/document-list';
import { SectionCard } from '@/components/detail/section-card';
import { SummaryCard } from '@/components/detail/summary-card';
import { topicNames, TopicList } from '@/components/detail/topic-list';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { spacing } from '@/theme/layout';
import type { GovProposalDelegate } from '@/types';

export default function ProposalDetailScreen() {
  const { gp, inr } = useLocalSearchParams<{ gp: string; inr: string }>();

  const proposal = useQuery({
    queryKey: ['gov-proposal', gp, inr],
    queryFn: async () => unwrap(await gov_proposal_by_path(gp, inr)),
  });

  return (
    <DetailScreen sourceUrl={parliamentUrl(gp, 'ME', inr)}>
      {proposal.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : proposal.isError ? (
        <Notice message="Ministerialentwurf konnte nicht geladen werden." />
      ) : (
        <ProposalDetail proposal={proposal.data} />
      )}
    </DetailScreen>
  );
}

function ProposalDetail({ proposal }: { proposal: GovProposalDelegate }) {
  const { ministrial_proposal: draft, ai_summary, vote_result } = proposal.gov_proposal;

  const topics = topicNames(proposal.gov_proposal.eurovoc_topics, ai_summary);
  const documents = pdfDocuments(proposal.gov_proposal.documents);
  const delegates = proposal.delegates ?? [];

  const title = ai_summary?.short_title ?? draft.title.split('|')[0].trim();

  const badges = [
    ...(draft.ressort ? [draft.ressort] : []),
    isoToDotDate(draft.raw_data_created_at),
    draft.gp,
  ];

  return (
    <>
      <SummaryCard
        title={title}
        subtitle={`Ministerialentwurf vom ${isoToDotDate(draft.raw_data_created_at)}`}
        summary={ai_summary?.short_summary ?? draft.description}
        badges={badges}
      />

      {topics.length > 0 ? <TopicList topics={topics} /> : null}

      {delegates.length > 0 ? (
        <SectionCard title="Eingebracht von">
          <View style={styles.issuers}>
            {delegates.map((delegate) => (
              <DelegateRow
                key={delegate.id}
                id={delegate.id}
                name={delegate.name}
                party={delegate.party}
              />
            ))}
          </View>
        </SectionCard>
      ) : null}

      {/* The vote this draft eventually became, where one exists  */}
      {vote_result ? (
        <SectionCard title="Regierungsvorlage">
          <VoteResultCard voteResult={vote_result} />
        </SectionCard>
      ) : null}

      {documents.length > 0 ? <DocumentList documents={documents} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  issuers: {
    gap: spacing.md,
  },
});
