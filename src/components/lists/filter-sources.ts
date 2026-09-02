import { useQuery } from '@tanstack/react-query';

import { somes } from '@/lib/somes';
import type { Party } from '@/types';

export type Sheet = 'topics' | 'second' | 'generic' | null;

/** a day, topics and legislative periods change once per period at most */
const STALE = 1000 * 60 * 60 * 24;

/** both tabs share one hook so switching tabs reuses the cached lists */
export function useFilterSources() {
  const topics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: () => somes.reference.eurovocTopics(),
    staleTime: STALE,
  });

  const periods = useQuery({
    queryKey: ['all-gps'],
    queryFn: () => somes.reference.legisPeriods(),
    staleTime: STALE,
  });

  return {
    topics: topics.data?.map((topic) => topic.topic) ?? [],
    periods: periods.data?.map((period) => period.gp) ?? [],
  };
}

export function withCount(label: string, count: number): string {
  return count > 0 ? `${label} (${count})` : label;
}

/** parties of the selected period, largest first, alle walks the periods newest
    first and keeps the first sighting of each code so a renamed party shows once */
export function partiesFor(
  partiesPerGp: Record<string, Party[]> | undefined,
  gp: string | null
): { name: string; color: string | null }[] {
  if (!partiesPerGp) return [];

  const collected = gp
    ? (partiesPerGp[gp] ?? [])
    : Object.keys(partiesPerGp)
        .sort()
        .reverse()
        .reduce<Party[]>((parties, key) => {
          partiesPerGp[key].forEach((party) => {
            if (!parties.some((seen) => seen.code === party.code)) parties.push(party);
          });
          return parties;
        }, []);

  return collected
    .slice()
    .sort((a, b) => b.fraction - a.fraction)
    .map((party) => ({ name: party.name, color: party.color }));
}
