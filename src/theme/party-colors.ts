import { useQuery } from '@tanstack/react-query';

import { parties } from '@/api/api';
import { unwrap } from '@/api/client';

import { colors } from './colors';

export function usePartyColors() {
  return useQuery({
    queryKey: ['party-colors'],
    queryFn: async () => {
      const result = unwrap(await parties());
      return new Map(result.map((party) => [party.name, party.color]));
    },
    // Parties change once per legislative period at most.
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/** Resolves a party name to its colour, falling back to the muted text colour. */
export function usePartyColor(partyName: string | null | undefined): string {
  const { data } = usePartyColors();
  if (!partyName) return colors.textMuted;
  return data?.get(partyName) ?? colors.textMuted;
}
