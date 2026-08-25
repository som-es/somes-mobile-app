import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import {
  delegate_by_id,
  general_delegate_info,
  speeches_by_delegate_per_page,
} from '@/api/api';
import { unwrap } from '@/api/client';
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
import type { Delegate, GeneralDelegateInfo, SpeechesWithMaxPage } from '@/types';

/**
 * Abgeordnete detail.
 *
 * Three requests, the same split somes.at makes: the base record, the aggregate
 * in `v1/delegates/extend/{id}` (interests, political position, absences, named
 * votes, stance scores) and the first page of speeches. The two aggregates are
 * slower than the base record, so each section renders as soon as its own data
 * lands rather than blocking on all three.
 */
export default function AbgeordneteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const delegate = useQuery({
    queryKey: ['delegate', id],
    queryFn: async () => unwrap(await delegate_by_id(Number(id))),
  });

  const info = useQuery({
    queryKey: ['delegate-info', id],
    queryFn: async () => unwrap(await general_delegate_info(Number(id))),
  });

  // `speeches_per_page` is 0-based, unlike every other paginated endpoint.
  const speeches = useQuery({
    queryKey: ['delegate-speeches', id],
    queryFn: async () => unwrap(await speeches_by_delegate_per_page(Number(id), 0)),
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
}: {
  delegate: Delegate;
  info: GeneralDelegateInfo | undefined;
  speeches: SpeechesWithMaxPage | undefined;
  infoPending: boolean;
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
            stances={info.left_right_stances}
            interests={info.interests}
          />
          <AbsencesCard absences={info.absences} />
          <TopicsCard interests={info.interests} />
        </>
      ) : null}

      {speeches ? (
        <DelegateSpeechesCard speeches={speeches.speeches} total={speeches.entry_count} />
      ) : null}

      {info ? <NamedVotesCard namedVotes={info.named_votes} /> : null}
    </>
  );
}
