import { StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/detail/section-card';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { InterestShare } from '@/types';

/** The design: the leading topic across the full width, then a 2×2 grid. */
const MAX_TILES = 5;

type Props = {
  interests: InterestShare[];
};

export function TopicsCard({ interests }: Props) {
  if (interests.length === 0) return null;

  const tiles = interests
    .slice()
    .sort((a, b) => b.occurences - a.occurences)
    .slice(0, MAX_TILES);

  const [lead, ...rest] = tiles;

  return (
    <SectionCard title="Themen">
      <View style={styles.grid}>
        <Tile interest={lead} wide />
        {rest.map((interest) => (
          <Tile key={interest.topic} interest={interest} />
        ))}
      </View>
    </SectionCard>
  );
}

function Tile({ interest, wide = false }: { interest: InterestShare; wide?: boolean }) {
  return (
    <View style={[styles.tile, wide ? styles.tileWide : styles.tileHalf]}>
      <Text style={typography.caption} numberOfLines={2}>
        {interest.topic}
      </Text>
      <Text style={styles.count}>{interest.occurences}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.inset,
    borderRadius: radius.track,
  },
  tileWide: {
    width: '100%',
  },
  /** Two per row, leaving room for the gap between them. */
  tileHalf: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  count: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textTitle,
  },
});
