import { partyLabel } from '@/components/cards/delegate-card';
import { age } from '@/lib/date';
import type { Delegate } from '@/types';

export type SortKey = 'name' | 'partei' | 'alter';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'partei', label: 'Partei' },
  { value: 'alter', label: 'Alter' },
];

/** only reorders whatever pages are already loaded — a real fix needs a sort
    param on the delegate search endpoint, which the app has no client for yet */
export function compareDelegates(sort: SortKey) {
  return (a: Delegate, b: Delegate) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'partei') return partyLabel(a.party).localeCompare(partyLabel(b.party));

    const ageA = age(a.birthdate);
    const ageB = age(b.birthdate);
    if (ageA === null) return ageB === null ? 0 : 1;
    if (ageB === null) return -1;
    return ageA - ageB;
  };
}
