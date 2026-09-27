import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Vote } from '@/types';

type Segment = {
  key: 'infavor' | 'against' | 'abstained' | 'absent';
  count: number;
  color: string;
};

type Props = {
  vote: Vote;
};

/** one shared 4-segment bar, identical for AT and EU since it only reacts to
    whatever counts the api returns — no country branching needed here */
export function VoteResultBar({ vote }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const segments: Segment[] = [
    { key: 'infavor', count: vote.infavor_count, color: colors.voteYes },
    { key: 'against', count: vote.against_count, color: colors.voteNo },
    { key: 'abstained', count: vote.abstention_count, color: colors.voteAbstain },
    { key: 'absent', count: vote.absence_count, color: colors.voteAbsent },
  ];
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const present = segments.filter((segment) => segment.count > 0);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        hitSlop={8}>
        <View style={styles.track}>
          {present.map((segment) => (
            <View
              key={segment.key}
              style={[styles.segment, { flexGrow: segment.count, backgroundColor: segment.color }]}
            />
          ))}
        </View>
      </Pressable>

      {open && total > 0 ? (
        <View style={styles.tooltip}>
          {present.map((segment) => (
            <View key={segment.key} style={styles.tooltipRow}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text style={typography.caption}>
                {t(`common:votingBehavior.${segment.key}`)} ·{' '}
                {((segment.count / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.voteAbsent,
  },
  segment: {
    height: '100%',
  },
  tooltip: {
    marginTop: spacing.sm,
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.inset,
    borderRadius: radius.track,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
