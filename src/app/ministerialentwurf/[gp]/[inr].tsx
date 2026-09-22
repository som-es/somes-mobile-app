import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
import { somes } from '@/lib/somes';
import { useLocale } from '@/lib/use-locale';
import { spacing } from '@/theme/layout';
import type { GovProposalDelegate } from '@/types';

export default function ProposalDetailScreen() {
  const { t } = useTranslation('votes');
  const { gp, inr } = useLocalSearchParams<{ gp: string; inr: string }>();

  const proposal = useQuery({
    queryKey: ['gov-proposal', gp, inr],
    queryFn: () => somes.govProposals.byPath(gp, inr),
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <DetailScreen sourceUrl={parliamentUrl(gp, 'ME', inr)}>
      {proposal.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : proposal.isError ? (
        <Notice message={t('proposalDetail.loadError')} />
      ) : (
        <ProposalDetail proposal={proposal.data} />
      )}
    </DetailScreen>
  );
}

function ProposalDetail({ proposal }: { proposal: GovProposalDelegate }) {
  const { t } = useTranslation('votes');
  const locale = useLocale();
  const { ministrial_proposal: draft, ai_summary, vote_result } = proposal.gov_proposal;

  const topics = topicNames(proposal.gov_proposal.eurovoc_topics, ai_summary);
  const documents = pdfDocuments(proposal.gov_proposal.documents);
  const delegates = proposal.delegates ?? [];

  const title = ai_summary?.short_title ?? draft.title.split('|')[0].trim();

  const badges = [
    ...(draft.ressort ? [draft.ressort_shortform ?? draft.ressort] : []),
    isoToDotDate(draft.raw_data_created_at, locale),
    draft.gp,
  ];

  return (
    <>
      <SummaryCard
        title={title}
        subtitle={t('proposalDetail.subtitle', { date: isoToDotDate(draft.raw_data_created_at, locale) })}
        summary={ai_summary?.short_summary ?? draft.description}
        aiGenerated={ai_summary?.short_summary != null}
        badges={badges}
      />

      {topics.length > 0 ? <TopicList topics={topics} /> : null}

      {delegates.length > 0 ? (
        <SectionCard title={t('detail.broughtBy')}>
          <View style={styles.issuers}>
            {delegates.map((delegate) => (
              <DelegateRow
                key={delegate.id}
                id={delegate.id}
                name={delegate.name}
                party={delegate.party}
                imageUrl={delegate.image_url}
              />
            ))}
          </View>
        </SectionCard>
      ) : null}

      {vote_result ? (
        <SectionCard title={t('proposalDetail.governmentBill')}>
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
