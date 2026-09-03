/* react binding over the persisted at/eu preference in @/lib/somes */
import { useSyncExternalStore } from 'react';

import { getCountry, setCountry, subscribeToCountry } from '@/lib/somes';
import type { Country } from '@/types';

export function useCountry(): Country {
  return useSyncExternalStore(subscribeToCountry, getCountry, getCountry);
}

/** persists the choice only, for now — wiring it up to actually change what
    the app requests and displays is a follow-up task */
export function useSwitchCountry(): (country: Country) => Promise<void> {
  return setCountry;
}
