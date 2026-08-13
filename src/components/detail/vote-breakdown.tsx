import { StyleSheet, Text, View } from 'react-native';

import { VoteMark } from '@/components/ui/vote-mark';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Vote } from '@/types';

type Props = {
  votes: Vote[];
};

export function VoteBreakdown({ votes }: Props) {
  const { data: partyColors } = usePartyColors();

  // `.slice()` first — `votes` belongs to the react-query cache.
  const sorted = votes.slice().sort((a, b) => b.fraction - a.fraction);

  return (
    <View style={styles.list}>
      {sorted.map((vote) => (
        <View key={vote.party} style={styles.row}>
          <View
            style={[styles.dot, { backgroundColor: partyColors?.get(vote.party) ?? '#ccc' }]}
          />
          <Text style={[typography.subtitle, styles.label]} numberOfLines={1}>
            {vote.party} ({vote.fraction} Abgeordnete)
          </Text>
          <VoteMark infavor={vote.infavor} size={18} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  label: {
    flex: 1,
  },
});
