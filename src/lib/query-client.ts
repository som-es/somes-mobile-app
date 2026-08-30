import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // parliamentary data updates in days, not seconds
      staleTime: 1000 * 60 * 5,
      retry: 1,
      // react native has no window focus event by default
      refetchOnWindowFocus: false,
    },
  },
});
