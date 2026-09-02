import { useQuery } from '@tanstack/react-query';

import { somes } from '@/lib/somes';

import { colors } from './colors';

export function usePartyColors() {
  return useQuery({
    queryKey: ['party-colors'],
    queryFn: async () => {
      const parties = await somes.reference.parties();
      return new Map(parties.map((party) => [party.name, party.color]));
    },
    // parties change once per legislative period at most
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function usePartyColor(partyName: string | null | undefined): string {
  const { data } = usePartyColors();
  if (!partyName) return colors.textMuted;
  return data?.get(partyName) ?? colors.textMuted;
}
