import { useQuery } from '@tanstack/react-query';

import { somes } from '@/lib/somes';

export const QUESTIONS_STATUS_KEY = ['questions-status'] as const;

// only EXPO_PUBLIC_-prefixed vars are inlined into the client bundle, so an
// unprefixed name here would always read as undefined at runtime
const QUESTION_OVERRIDE = process.env.EXPO_PUBLIC_OVERRIDE_QUESTIONS === 'true';

/** undefined while loading/on error defaults to enabled, so the tab doesn't
    flicker away on a slow network — it only hides once the server confirms
    the feature is off */
export function useQuestionsEnabled() {
  const { data } = useQuery({
    queryKey: QUESTIONS_STATUS_KEY,
    queryFn: () => somes.delegateQuestions.status(),
    staleTime: 5 * 60 * 1000,
  });

  return QUESTION_OVERRIDE || (data?.enabled ?? true);
}
