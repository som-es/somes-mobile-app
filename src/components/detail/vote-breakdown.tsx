import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VoteMark } from '@/components/ui/vote-mark';
import { byPartySize, partyInfavor } from '@/lib/votes';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { NamedVoteInfo, Vote } from '@/types';

import { VoteResultBar } from './vote-result-bar';

type Props = {
  votes: Vote[];
};

export function VoteBreakdown({ votes }: Props) {
  const { data: partyColors } = usePartyColors();

  // slice first, votes belongs to the react-query cache
  const sorted = votes.slice().sort(byPartySize);

  return (
    <View style={styles.list}>
      {sorted.map((vote) => (
        <View key={vote.party} style={styles.partyBlock}>
          <View style={styles.row}>
            <View
              style={[styles.dot, { backgroundColor: partyColors?.get(vote.party) ?? '#ccc' }]}
            />
            <Text style={[typography.subtitle, styles.label]} numberOfLines={1}>
              {vote.party}
            </Text>
            <VoteMark infavor={partyInfavor(vote)} size={18} />
          </View>
          <VoteResultBar vote={vote} />
        </View>
      ))}
    </View>
  );
}

type NamedProps = {
  info: NamedVoteInfo;
};

/** the party-line breakdown above has no equivalent roll-call total anywhere
    else in the app, this is the only place a named vote's result is shown */
export function NamedVoteBreakdown({ info }: NamedProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.list}>
      <View style={styles.row}>
        <VoteMark infavor size={18} />
        <Text style={[typography.subtitle, styles.label]}>
          {t('common:detail.namedFor', { count: info.pro_count, total: info.given_vote_sum })}
        </Text>
      </View>
      <View style={styles.row}>
        <VoteMark infavor={false} size={18} />
        <Text style={[typography.subtitle, styles.label]}>
          {t('common:detail.namedAgainst', { count: info.contra_count, total: info.given_vote_sum })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  partyBlock: {
    gap: spacing.sm,
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
