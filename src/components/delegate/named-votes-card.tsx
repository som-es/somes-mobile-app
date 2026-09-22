import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OpinionCard, OpinionLegend } from '@/components/delegate/opinion';
import { SectionCard } from '@/components/detail/section-card';
import { Badge } from '@/components/ui/badge';
import { SectionLink } from '@/components/ui/section-link';
import { VoteMark } from '@/components/ui/vote-mark';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useLocale } from '@/lib/use-locale';
import { voteBadges } from '@/lib/vote-labels';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { NamedVote, VoteResult } from '@/types';

const PREVIEW = 3;

type Props = {
  namedVotes: NamedVote[];
};

/** every row needs its own vote_result_by_id, a named vote carries no title */
export function NamedVotesCard({ namedVotes }: Props) {
  const { t } = useTranslation('delegates');
  const router = useRouter();
  const [visible, setVisible] = useState(PREVIEW);
  const shown = namedVotes.slice(0, visible);
  const remaining = namedVotes.length - shown.length;

  const results = useQueries({
    queries: shown.map((namedVote) => ({
      queryKey: ['vote-result', String(namedVote.legis_init_id)],
      queryFn: () => somes.voteResults.byId(namedVote.legis_init_id),
    })),
  });

  if (namedVotes.length === 0) return null;

  return (
    <SectionCard title={t('namedVotes.title')} action={<OpinionLegend />}>
      <Text style={[typography.caption, styles.total]}>
        {t('namedVotes.totalCount', { count: namedVotes.length })}
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
                <Text style={typography.caption}>{t('namedVotes.loading')}</Text>
              ) : result.isError || !result.data ? (
                <Text style={typography.bodyMuted}>{t('namedVotes.error')}</Text>
              ) : (
                <NamedVoteBody voteResult={result.data} namedVote={namedVote} />
              )}
            </OpinionCard>
          );
        })}
      </View>

      {remaining > 0 ? (
        <View style={styles.more}>
          <SectionLink
            label={t('namedVotes.more', { count: remaining })}
            onPress={() => setVisible(visible + PREVIEW)}
          />
        </View>
      ) : null}
    </SectionCard>
  );
}

function NamedVoteBody({
  voteResult,
  namedVote,
}: {
  voteResult: VoteResult;
  namedVote: NamedVote;
}) {
  const { t } = useTranslation('delegates');
  const locale = useLocale();
  const { legislative_initiative: initiative, ai_summary } = voteResult;
  const { infavor } = namedVote;

  return (
    <View style={styles.body}>
      <View style={styles.titleRow}>
        <Text style={[typography.rowTitle, styles.title]} numberOfLines={2}>
          {ai_summary?.short_title ?? initiative.description}
        </Text>
        {infavor !== null ? (
          <VoteMark infavor={infavor} size={18} />
        ) : (
          <Text style={typography.caption}>
            {namedVote.was_absent ? t('namedVotes.absent') : t('namedVotes.noVote')}
          </Text>
        )}
      </View>

      <Text style={typography.caption}>
        {isoToDotDate(initiative.nr_plenary_activity_date, locale)}
      </Text>

      {ai_summary?.short_summary ? (
        <Text style={typography.body} numberOfLines={2}>
          {ai_summary.short_summary}
        </Text>
      ) : null}

      <View style={styles.badges}>
        {ai_summary?.short_summary ? <Badge label={t('namedVotes.aiSummaryBadge')} /> : null}
        {voteBadges(t, locale, initiative).map((label) => (
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
    marginTop: spacing.md,
  },
});
