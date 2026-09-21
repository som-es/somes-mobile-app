import { partyLabel } from '@/components/cards/delegate-card';
import { age } from '@/lib/date';
import type { Delegate } from '@/types';

export type SortKey = 'name' | 'partei' | 'alter';
export type SortDirection = 'asc' | 'desc';
export type Sort = { key: SortKey; direction: SortDirection } | null;

export const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'partei', label: 'Partei' },
  { key: 'alter', label: 'Alter' },
];

/** clicking the active column flips direction, clicking another column starts
    it ascending — the table-header convention */
export function toggleSort(current: Sort, key: SortKey): Sort {
  if (current?.key !== key) return { key, direction: 'asc' };
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

/** null leaves the list in API order. only reorders whatever pages are already
    loaded — a real fix needs a sort param on the delegate search endpoint,
    which the app has no client for yet */
export function compareDelegates(sort: Sort) {
  if (!sort) return () => 0;
  const dir = sort.direction === 'asc' ? 1 : -1;

  return (a: Delegate, b: Delegate) => {
    if (sort.key === 'name') return dir * a.name.localeCompare(b.name);
    if (sort.key === 'partei') {
      return dir * partyLabel(a.party).localeCompare(partyLabel(b.party));
    }

    // missing ages stay last regardless of direction, not just at whichever
    // end the flipped comparator happens to land them
    const ageA = age(a.birthdate);
    const ageB = age(b.birthdate);
    if (ageA === null) return ageB === null ? 0 : 1;
    if (ageB === null) return -1;
    return dir * (ageA - ageB);
  };
}
