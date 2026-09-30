import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VoteDonut } from '@/components/ui/vote-donut';
import { VoteMark } from '@/components/ui/vote-mark';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { voteBadges } from '@/lib/vote-labels';
import { byPartySize, partyInfavor, partySegments } from '@/lib/votes';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import { type VoteResult } from '@/types';

type Props = {
  voteResult: VoteResult;
};

export function VoteResultCard({ voteResult }: Props) {
  const { t } = useTranslation('votes');
  const locale = useLocale();
  const router = useRouter();
  const country = useCountry();
  const { legislative_initiative: initiative, ai_summary, named_votes } = voteResult;

  const title = ai_summary?.short_title ?? initiative.description;
  // whether the vote has concluded at all, independent of the country check below
  const hasResult = initiative.accepted !== null;
  // EU acceptance data isn't ready to surface yet, the breakdown below still is
  const showAcceptedMark = country !== 'eu' && hasResult;
  // slice first, votes belongs to the react-query cache
  const votes = voteResult.votes.slice().sort(byPartySize);

  return (
    <Card
      onPress={() =>
        router.push({
          pathname: '/abstimmung/[gp]/[ityp]/[inr]',
          params: { gp: initiative.gp, ityp: initiative.ityp, inr: initiative.inr },
        })
      }>
      <View style={styles.titleRow}>
        <Text style={[typography.cardTitle, styles.title]}>{title}</Text>
        {showAcceptedMark ? <VoteMark infavor={initiative.accepted === 'a'} size={24} /> : null}
      </View>

      {ai_summary?.short_summary ? (
        <Text style={[typography.body, styles.summary]} numberOfLines={2}>
          {ai_summary.short_summary}
        </Text>
      ) : null}

      {hasResult ? (
        <View style={styles.votes}>
          {votes.length > 0
            ? votes.map((vote) => (
                <View key={vote.party} style={styles.vote}>
                  <Text style={typography.partyLabel}>{vote.party}</Text>
                  {/* an anonymous vote only has pass or fail per party, a split donut
                      means something only when the members voted by name */}
                  {initiative.voted_by_name === true ? (
                    <VoteDonut segments={partySegments(vote)} size={20} />
                  ) : (
                    <VoteMark infavor={partyInfavor(vote)} size={16} />
                  )}
                </View>
              ))
            : null}

          {named_votes ? (
            <>
              <View style={styles.vote}>
                <VoteMark infavor size={16} />
                <Text style={typography.partyLabel}>{named_votes.named_vote_info.pro_count}</Text>
              </View>
              <View style={styles.vote}>
                <VoteMark infavor={false} size={16} />
                <Text style={typography.partyLabel}>
                  {named_votes.named_vote_info.contra_count}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      <View style={styles.badges}>
        {ai_summary?.short_summary ? <Badge label={t('common:detail.aiSummaryBadge')} /> : null}
        {voteBadges(t, locale, initiative).map((label) => (
          <Badge key={label} label={label} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  summary: {
    marginTop: spacing.sm,
  },
  votes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginTop: spacing.md,
  },
  vote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
