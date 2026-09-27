import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { somes } from '@/lib/somes';
import { topicGroup } from '@/theme/topic-groups';

/** a day, the eurovoc list changes once per legislative period at most */
const STALE = 1000 * 60 * 60 * 24;

/** InterestShare/StanceTopicScore carry a locale-invariant topic_id alongside
    their .topic name, but delegates.extended()'s language param translates that
    name — topicColor()/topicGroupLabel() key off the canonical German group
    name, so resolving through topic_id keeps the lookup correct under any UI
    language instead of missing (and silently falling back to gray) under
    English. eurovocTopics() itself takes no language param at all, so its
    topic strings are always the untranslated canonical ones topicGroup()
    expects, and it's already fetched/cached under ['eurovoc-topics'] elsewhere
    (filter-sources.ts, interests-card.tsx), so this reuses that cache entry
    rather than firing a second request */
export function useTopicGroupLookup() {
  const topics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: () => somes.reference.eurovocTopics(),
    staleTime: STALE,
  });

  const groupById = useMemo(
    () => new Map((topics.data ?? []).map((topic) => [topic.id, topicGroup(topic.topic)])),
    [topics.data]
  );

  return {
    /** falls back to grouping the (possibly translated) name directly when the
        id isn't found yet, e.g. before the topics list has loaded */
    resolve: (topicId: string, fallbackTopicName: string): string =>
      groupById.get(topicId) ?? topicGroup(fallbackTopicName),
  };
}
