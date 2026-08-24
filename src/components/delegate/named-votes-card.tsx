import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { vote_result_by_id } from '@/api/api';
import { unwrap } from '@/api/client';
import { OpinionCard, OpinionLegend } from '@/components/delegate/opinion';
import { SectionCard } from '@/components/detail/section-card';
import { Badge } from '@/components/ui/badge';
import { SectionLink } from '@/components/ui/section-link';
import { VoteMark } from '@/components/ui/vote-mark';
import { isoToDotDate } from '@/lib/date';
import { voteBadges } from '@/lib/vote-labels';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { NamedVote, VoteResult } from '@/types';

const PREVIEW = 3;

type Props = {
  namedVotes: NamedVote[];
};

/**
 * "Letzte namentliche Abstimmungen".
 *
 * A member's `NamedVote` carries only `legis_init_id` and how they voted — no
 * title. So, exactly as the web's `NamedVoteBar` does, each one is resolved
 * through `vote_result_by_id` — one request per row, which is why they are
 * revealed a few at a time rather than all at once.
 *
 * The rows are laid out here rather than handed to `VoteResultCard`: that card
 * is a card, and nesting one inside a section card reads as a box in a box. The
 * design wants an inset row whose left edge carries the member's own vote.
 */
export function NamedVotesCard({ namedVotes }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(PREVIEW);
  const shown = namedVotes.slice(0, visible);
  const remaining = namedVotes.length - shown.length;

  const results = useQueries({
    queries: shown.map((namedVote) => ({
      queryKey: ['vote-result', String(namedVote.legis_init_id)],
      queryFn: async () => unwrap(await vote_result_by_id(String(namedVote.legis_init_id))),
    })),
  });

  if (namedVotes.length === 0) return null;

  return (
    <SectionCard title="Letzte namentliche Abstimmungen" action={<OpinionLegend />}>
      <Text style={[typography.caption, styles.total]}>
        {namedVotes.length} {namedVotes.length === 1 ? 'Abstimmung' : 'Abstimmungen'} insgesamt
      </Text>

      <View style={styles.list}>
        {shown.map((namedVote, index) => {
          const result = results[index];
          const initiative = result.data?.legislative_initiative;

          return (
            <OpinionCard
              key={namedVote.legis_init_id}
              infavor={namedVote.infavor}
              onPress={
                initiative
                  ? () =>
                      router.push({
                        pathname: '/abstimmung/[gp]/[ityp]/[inr]',
                        params: {
                          gp: initiative.gp,
                          ityp: initiative.ityp,
                          inr: initiative.inr,
                        },
                      })
                  : undefined
              }>
              {result.isPending ? (
                <Text style={typography.caption}>Wird geladen…</Text>
              ) : result.isError || !result.data ? (
                <Text style={typography.bodyMuted}>Abstimmung konnte nicht geladen werden.</Text>
              ) : (
                <NamedVoteBody voteResult={result.data} infavor={namedVote.infavor} />
              )}
            </OpinionCard>
          );
        })}
      </View>

      {remaining > 0 ? (
        <View style={styles.more}>
          <SectionLink
            label={`Weitere Abstimmungen (${remaining})`}
            onPress={() => setVisible(visible + PREVIEW)}
          />
        </View>
      ) : null}
    </SectionCard>
  );
}

function NamedVoteBody({
  voteResult,
  infavor,
}: {
  voteResult: VoteResult;
  infavor: boolean | null;
}) {
  const { legislative_initiative: initiative, ai_summary } = voteResult;

  return (
    <View style={styles.body}>
      <View style={styles.titleRow}>
        <Text style={[typography.rowTitle, styles.title]} numberOfLines={2}>
          {ai_summary?.short_title ?? initiative.description}
        </Text>
        {infavor !== null ? <VoteMark infavor={infavor} size={18} /> : null}
      </View>

      <Text style={typography.caption}>
        {isoToDotDate(initiative.nr_plenary_activity_date)}
      </Text>

      {ai_summary?.short_summary ? (
        <Text style={typography.caption} numberOfLines={2}>
          {ai_summary.short_summary}
        </Text>
      ) : null}

      <View style={styles.badges}>
        {voteBadges(initiative).map((label) => (
          <Badge key={label} label={label} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  more: {
    marginTop: spacing.md,
  },
  body: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
