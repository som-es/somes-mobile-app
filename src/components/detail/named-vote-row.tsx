import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { VoteMark } from '@/components/ui/vote-mark';
import { behaviorLabel, votingBehaviorOf } from '@/lib/named-vote-behavior';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, RollCallVote } from '@/types';

const AVATAR = 40;

type Props = {
  vote: RollCallVote;
  delegate: Delegate | undefined;
};

export function NamedVoteRow({ vote, delegate }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const country = useCountry();
  const partyColor = usePartyColor(delegate?.party);
  const behavior = votingBehaviorOf(vote);

  return (
    <Card
      variant="outlined"
      elevation="row"
      onPress={() =>
        router.push({ pathname: '/abgeordnete/[id]', params: { id: vote.delegate_id } })
      }>
      <View style={styles.row}>
        <Avatar
          uri={delegateAvatarUrl(country, vote.delegate_id, delegate?.image_url ?? null)}
          size={AVATAR}
          accessibilityLabel={delegate?.name}
        />

        <View style={styles.text}>
          <Text style={typography.rowTitle} numberOfLines={1}>
            {delegate?.name ?? t('common:detail.unknownDelegateNumbered', { id: vote.delegate_id })}
          </Text>
          {delegate?.party ? (
            <View style={styles.meta}>
              <View style={[styles.dot, { backgroundColor: partyColor }]} />
              <Text style={typography.caption}>{delegate.party}</Text>
            </View>
          ) : null}
        </View>

        {behavior === 'infavor' || behavior === 'against' ? (
          <VoteMark infavor={behavior === 'infavor'} size={18} />
        ) : behavior === 'abstained' ? (
          <Text
            style={styles.abstainDash}
            accessibilityLabel={behaviorLabel(t, behavior)}>
            {'—'}
          </Text>
        ) : (
          <Text style={typography.caption}>{behaviorLabel(t, behavior)}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  abstainDash: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.voteAbstain,
  },
});
