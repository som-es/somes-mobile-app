import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { somes } from '@/lib/somes';
import { useLocale } from '@/lib/use-locale';

/** InterestShare.topic / StanceTopicScore.topic are already one of the ~20
    canonical category names, fully translated by delegates.extended()'s
    language param — topic_id is stable across languages (and across AT/EU)
    for that same small id-space, which is disjoint from eurovocTopics()'s
    ~184-entry leaf-topic ids, so that endpoint can't resolve it. There's no
    dedicated small endpoint for this id-space, so re-fetch the same
    delegate's info forced to German to recover the canonical name — skipped
    entirely when the UI locale is already German, since .topic is already
    correct then */
export function useTopicGroupLookup(delegateId: number) {
  const locale = useLocale();
  const needsGerman = locale !== 'de-AT';

  const info = useQuery({
    queryKey: ['delegate-info', delegateId, 'de'],
    queryFn: () => somes.delegates.extended(delegateId, 'de'),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: needsGerman,
  });

  const germanNameById = useMemo(() => {
    if (!info.data) return new Map<string, string>();
    return new Map([
      ...info.data.interests.map((i) => [i.topic_id, i.topic] as const),
      ...(info.data.political_position?.scores_by_topic.map(
        (s) => [s.topic_id, s.topic] as const
      ) ?? []),
    ]);
  }, [info.data]);

  return {
    resolve: (topicId: string, fallbackTopicName: string): string =>
      germanNameById.get(topicId) ?? fallbackTopicName,
  };
}
