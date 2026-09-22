import { StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/detail/section-card';
import { radius, spacing } from '@/theme/layout';
import { topicColor } from '@/theme/topic-colors';
import { typography } from '@/theme/typography';
import type { InterestShare } from '@/types';

/** matches the web's top-tile cap, everything past this collapses into one tile */
const MAX_TILES = 8;
const MUTED_TILE = '#64748b';

type Props = {
  interests: InterestShare[];
};

export function TopicsCard({ interests }: Props) {
  if (interests.length === 0) return null;

  const sorted = interests.slice().sort((a, b) => b.occurences - a.occurences);
  const tiles = sorted.slice(0, MAX_TILES);
  const overflow = sorted.slice(MAX_TILES);

  const [lead, ...rest] = tiles;

  return (
    <SectionCard title="Themen">
      <View style={styles.grid}>
        <Tile label={lead.topic} count={lead.occurences} color={topicColor(lead.topic)} wide />
        {rest.map((interest) => (
          <Tile
            key={interest.topic}
            label={interest.topic}
            count={interest.occurences}
            color={topicColor(interest.topic)}
          />
        ))}
        {overflow.length > 0 ? (
          <Tile
            label="Weitere Themen"
            count={overflow.reduce((sum, interest) => sum + interest.occurences, 0)}
            color={MUTED_TILE}
          />
        ) : null}
      </View>
    </SectionCard>
  );
}

function Tile({
  label,
  count,
  color,
  wide = false,
}: {
  label: string;
  count: number;
  color: string;
  wide?: boolean;
}) {
  const textColor = readableOn(color);

  return (
    <View style={[styles.tile, { backgroundColor: color }, wide ? styles.tileWide : styles.tileHalf]}>
      <Text style={[typography.caption, { color: textColor }]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.count, { color: textColor }]}>{count}</Text>
    </View>
  );
}

/** simple relative-luminance check, black text on light tiles and white on dark
    ones so the fixed topic palette (some very light, some very dark) stays legible */
function readableOn(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#FFFFFF';
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
    borderRadius: radius.track,
  },
  tileWide: {
    width: '100%',
  },
  tileHalf: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  count: {
    fontSize: 24,
    fontWeight: '600',
  },
});
