import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { DetailScreen } from '@/components/detail/detail-screen';
import { DocumentList, pdfDocuments } from '@/components/detail/document-list';
import { SummaryCard } from '@/components/detail/summary-card';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import type { Decree } from '@/types';

export default function DecreeDetailScreen() {
  const { risId } = useLocalSearchParams<{ risId: string }>();

  const decree = useQuery({
    queryKey: ['decree', risId],
    queryFn: () => somes.decrees.byRisId(risId),
  });

  return (
    // a decree is not on parlament.gv.at and only carries its own link once loaded,
    // so unlike the other detail screens the source cannot come from the route
    <DetailScreen
      sourceUrl={decree.data?.document_url ?? undefined}
      sourceLabel="Auf ris.bka.gv.at öffnen">
      {decree.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : decree.isError ? (
        <Notice message="Verordnung konnte nicht geladen werden." />
      ) : (
        <DecreeDetail decree={decree.data} />
      )}
    </DetailScreen>
  );
}

function DecreeDetail({ decree }: { decree: Decree }) {
  const { ai_summary } = decree;

  const documents = pdfDocuments(decree.documents);
  const title = ai_summary?.short_title ?? decree.short_title;
  // without an ai summary the full legal title is the only prose there is, and it is
  // worth showing as the body whenever the heading is not already that same string
  const summary = ai_summary?.short_summary ?? (decree.title === title ? null : decree.title);

  const badges = [
    ...(decree.ministrial_issuer ? [decree.ministrial_issuer] : []),
    isoToDotDate(decree.publication_date),
    ...(decree.gp ? [decree.gp] : []),
  ];

  return (
    <>
      <SummaryCard
        title={title}
        subtitle={`Verordnung vom ${isoToDotDate(decree.publication_date)}`}
        summary={summary}
        badges={badges}
      />

      {documents.length > 0 ? <DocumentList documents={documents} /> : null}
    </>
  );
}
