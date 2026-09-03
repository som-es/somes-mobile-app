/* react binding over the persisted at/eu preference in @/lib/somes */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';

import { getCountry, setCountry, subscribeToCountry } from '@/lib/somes';
import type { Country } from '@/types';

export function useCountry(): Country {
  return useSyncExternalStore(subscribeToCountry, getCountry, getCountry);
}

/** every query key in the app is flat/country-agnostic, so unlike sign-in there is
    no small curated subset to invalidate, resetting everything is simpler and
    correct. resetQueries (not clear!) is required here: clear() destroys the
    cached Query objects without notifying their observers, so a screen that
    isn't re-rendered for some other reason keeps showing the old country's data
    until it happens to remount. resetQueries puts every query back to pending
    and actively refetches the ones with a mounted observer, no remount needed.
    setCountry rebuilds the somes client synchronously before its await, so
    awaiting it first guarantees the refetch below uses the new client */
export function useSwitchCountry(): (country: Country) => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(
    async (country: Country) => {
      await setCountry(country);
      await queryClient.resetQueries();
    },
    [queryClient]
  );
}
