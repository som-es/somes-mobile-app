import { useQuery } from '@tanstack/react-query';

import { MOCK_DELEGATE, MOCK_QUESTIONS } from '@/lib/mock-questions';
import { somes } from '@/lib/somes';

/** shares the ['delegate', id] cache entry with the profile and favourites
    screens, so a list of question cards only fetches each MP once */
export function useDelegate(id: number | undefined) {
  return useQuery({
    queryKey: ['delegate', String(id)],
    // mock ids are negative, so mocking never hits the API for the fixture MP
    queryFn: () =>
      MOCK_QUESTIONS && id! < 0 ? Promise.resolve(MOCK_DELEGATE) : somes.delegates.byId(id!),
    enabled: id !== undefined,
    staleTime: 1000 * 60 * 60,
  });
}
