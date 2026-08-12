import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { isoToDotDate } from '@/lib/date';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { VoteResult } from '@/types';

/** VoteTypeBadge.svelte, verbatim. */
const VOTE_TYPE: Record<string, string> = {
  Law: 'Gesetz',
  Amendment: 'Abänderung',
  Resolution: 'Entschließung',
  Report: 'Bericht',
};

function voteTypeLabel(voting: string | null): string {
  if (!voting) return 'Andere';
  return VOTE_TYPE[voting] ?? '';
}

/** The green tick / red cross the design uses for every yes-no signal. */
function VoteMark({ infavor, size }: { infavor: boolean; size: number }) {
  return (
    <Ionicons
      name={infavor ? 'checkmark' : 'close'}
      size={size}
      color={infavor ? colors.voteYes : colors.voteNo}
    />
  );
}

type Props = {
  voteResult: VoteResult;
};

/** Figma node 286:52 — mirrors VoteResultExpandableBar.svelte's data selection. */
export function VoteResultCard({ voteResult }: Props) {
  const { legislative_initiative: initiative, ai_summary, named_votes } = voteResult;

  const title = ai_summary?.short_title ?? initiative.description;
  const accepted = initiative.accepted;
  // `.slice()` first — `votes` belongs to the react-query cache.
  const votes = voteResult.votes.slice().sort((a, b) => b.fraction - a.fraction);
  const typeLabel = voteTypeLabel(initiative.voting);

  return (
    <Card>
      <View style={styles.titleRow}>
        <Text style={[typography.cardTitle, styles.title]}>{title}</Text>
        {accepted !== null ? <VoteMark infavor={accepted === 'a'} size={24} /> : null}
      </View>

      {ai_summary?.short_summary ? (
        <Text style={[typography.body, styles.summary]} numberOfLines={2}>
          {ai_summary.short_summary}
        </Text>
      ) : null}

      {accepted !== null ? (
        <View style={styles.votes}>
          {votes.length > 0 ? (
            votes.map((vote) => (
              <View key={vote.party} style={styles.vote}>
                <Text style={typography.partyLabel}>{vote.party}</Text>
                <VoteMark infavor={vote.infavor} size={16} />
              </View>
            ))
          ) : named_votes ? (
            // Roll-call vote with no per-party breakdown: the raw tally, as the
            // web falls back to in its named_votes branch.
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
        <Badge label={initiative.requires_simple_majority ? 'einfache Mehrheit' : '2/3 Mehrheit'} />
        <Badge label={initiative.gp} />
        <Badge label={isoToDotDate(initiative.nr_plenary_activity_date)} />
        {typeLabel ? <Badge label={typeLabel} /> : null}
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
  /** Six parties will not fit on one 353pt line — let them reflow. */
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
