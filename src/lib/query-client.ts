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
