/**
 * react-query stands in for the web app's hand-rolled persisted caches
 * (somes-frontend/src/lib/caching/*), which exist to work around SvelteKit's
 * load semantics. Here it also gives pull-to-refresh and
 * stale-while-revalidate for free.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Parliamentary data updates on the order of days, not seconds.
      staleTime: 1000 * 60 * 5,
      retry: 1,
      // React Native has no window focus event by default.
      refetchOnWindowFocus: false,
    },
  },
});
