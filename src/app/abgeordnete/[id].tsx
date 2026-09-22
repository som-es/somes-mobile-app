import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { AbsencesCard } from '@/components/delegate/absences-card';
import { DelegateHeaderCard } from '@/components/delegate/delegate-header-card';
import { DelegateSpeechesCard } from '@/components/delegate/delegate-speeches-card';
import { NamedVotesCard } from '@/components/delegate/named-votes-card';
import { PoliticalStanceCard } from '@/components/delegate/political-stance-card';
import { TopicsCard } from '@/components/delegate/topics-card';
import { DetailScreen, personUrl } from '@/components/detail/detail-screen';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { somes } from '@/lib/somes';
import type { Delegate, GeneralDelegateInfo, SpeechesWithMaxPage } from '@/types';

export default function AbgeordneteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const delegate = useQuery({
    queryKey: ['delegate', id],
    queryFn: () => somes.delegates.byId(Number(id)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const info = useQuery({
    queryKey: ['delegate-info', id],
    queryFn: () => somes.delegates.extended(Number(id)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  // speeches_per_page is 0 based, unlike every other paginated endpoint
  const speeches = useQuery({
    queryKey: ['delegate-speeches', id],
    queryFn: () => somes.delegates.speeches(Number(id), 0),
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <DetailScreen
      sourceUrl={personUrl(id)}
      action={<FavoriteButton kind="delegate" id={Number(id)} />}>
      {delegate.isPending ? (
        <CardSkeleton />
      ) : delegate.isError ? (
        <Notice message="Abgeordnete:r konnte nicht geladen werden." />
      ) : (
        <DelegateDetail
          delegate={delegate.data}
          info={info.data}
          speeches={speeches.data}
          infoPending={info.isPending}
          speechesPending={speeches.isPending}
        />
      )}
    </DetailScreen>
  );
}

function DelegateDetail({
  delegate,
  info,
  speeches,
  infoPending,
  speechesPending,
}: {
  delegate: Delegate;
  info: GeneralDelegateInfo | undefined;
  speeches: SpeechesWithMaxPage | undefined;
  infoPending: boolean;
  speechesPending: boolean;
}) {
  return (
    <>
      <DelegateHeaderCard delegate={delegate} />

      {infoPending ? <CardSkeleton /> : null}

      {info ? (
        <>
          <PoliticalStanceCard
            name={delegate.name}
            party={delegate.party}
            position={info.political_position}
            // left_right_stances was removed, the same topic and score list hangs off the position now
            stances={info.political_position?.scores_by_topic ?? []}
            interests={info.interests}
          />
          <AbsencesCard absences={info.absences} />
          <TopicsCard interests={info.interests} />
        </>
      ) : null}

      {speechesPending ? <CardSkeleton /> : null}

      {speeches ? (
        <DelegateSpeechesCard speeches={speeches.speeches} total={speeches.entry_count} />
      ) : null}

      {info ? <NamedVotesCard namedVotes={info.named_votes} /> : null}
    </>
  );
}
