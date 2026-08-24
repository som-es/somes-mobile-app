import { StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/detail/section-card';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { topicColor } from '@/theme/topic-colors';
import { typography } from '@/theme/typography';
import type { InterestShare, PoliticalPosition, StanceTopicScore } from '@/types';

/**
 * somes-frontend draws the compass on a 240pt canvas and offsets the dot by
 * 20pt per unit of score (`PoliticalSpectrum.svelte`'s `SCALAR`) inside a 200pt
 * plot. Ours is fluid, so the same offset is a share of the plot instead.
 */
const PERCENT_PER_UNIT = (20 / 200) * 100;
/** Keep an off-the-chart score inside the frame rather than clipping it. */
const EDGE = 6;

const DOT = 14;
const STANCE_DOT = 16;
const RAIL = 6;
/** How wide a rotated side label lays out before it is turned upright. */
const SIDE_LABEL = 120;
/** `LeftRightChart` keeps the eight topics the member speaks about most. */
const MAX_STANCES = 8;

type Props = {
  name: string;
  party: string | null;
  position: PoliticalPosition | null;
  stances: StanceTopicScore[];
  interests: InterestShare[];
};

/**
 * "Politische Haltung & Richtung" — the two-axis compass and the per-topic
 * left/right rails, both derived by the backend from the member's votes.
 */
export function PoliticalStanceCard({ name, party, position, stances, interests }: Props) {
  const partyColor = usePartyColor(party);
  const ranked = rankStances(stances, interests);

  if (!position && ranked.length === 0) return null;

  return (
    <SectionCard title="Politische Haltung & Richtung">
      {position ? <Compass name={name} color={partyColor} position={position} /> : null}
      {ranked.length > 0 ? <StanceRails stances={ranked} hasCompass={!!position} /> : null}
    </SectionCard>
  );
}

function Compass({
  name,
  color,
  position,
}: {
  name: string;
  color: string;
  position: PoliticalPosition;
}) {
  // Positive x leans capitalist, positive y authoritarian — the web's
  // `leftScore` / `liberalScore`. Screen y grows downwards, hence the negation.
  const x = clamp(50 + (position.is_not_left - position.is_left) * PERCENT_PER_UNIT);
  const y = clamp(50 - (position.is_not_liberal - position.is_liberal) * PERCENT_PER_UNIT);

  return (
    <View style={styles.compass}>
      <Text style={[typography.caption, styles.poleLabel]}>AUTORITÄR</Text>

      <View style={styles.compassMiddle}>
        <SideLabel label="SOZIALISTISCH" />

        <View style={styles.plot}>
          <View style={styles.axisVertical} />
          <View style={styles.axisHorizontal} />

          <View style={[styles.marker, { left: `${x}%`, top: `${y}%` }]}>
            <Text style={[typography.caption, styles.markerLabel]} numberOfLines={1}>
              {name}
            </Text>
            <View style={[styles.dot, { backgroundColor: color }]} />
          </View>
        </View>

        <SideLabel label="KAPITALISTISCH" />
      </View>

      <Text style={[typography.caption, styles.poleLabel]}>LIBERTÄR</Text>
    </View>
  );
}

/**
 * A pole label turned on its side. The text lays out at its natural width and
 * overflows the narrow column, then the rotation brings it upright inside it.
 */
function SideLabel({ label }: { label: string }) {
  return (
    <View style={styles.sideLabel}>
      <Text style={[typography.caption, styles.sideLabelText]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function StanceRails({
  stances,
  hasCompass,
}: {
  stances: StanceTopicScore[];
  hasCompass: boolean;
}) {
  return (
    <View style={[styles.stances, hasCompass && styles.stancesSpaced]}>
      {stances.map((stance) => {
        // The web maps a score of -0.5..0.5 across the full rail.
        const at = clamp((stance.score * 2 + 1) * 50);

        return (
          <View key={stance.topic} style={styles.stanceRow}>
            <Text style={[typography.subtitle, styles.stanceTopic]} numberOfLines={1}>
              {stance.topic}
            </Text>

            <View style={styles.railRow}>
              <Text style={[typography.caption, styles.railEnd]} numberOfLines={1}>
                Links
              </Text>

              <View style={styles.rail}>
                <View
                  style={[
                    styles.stanceDot,
                    { left: `${at}%`, backgroundColor: topicColor(stance.topic) },
                  ]}
                />
              </View>

              <Text
                style={[typography.caption, styles.railEnd, styles.railEndRight]}
                numberOfLines={1}>
                Rechts
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * The web ranks by how often the member actually speaks on a topic, keeps the
 * top eight, then orders those left to right.
 */
function rankStances(stances: StanceTopicScore[], interests: InterestShare[]) {
  return stances
    .map((stance) => ({
      stance,
      occurences: interests.find((interest) => interest.topic === stance.topic)?.occurences ?? 0,
    }))
    .sort((a, b) => b.occurences - a.occurences)
    .slice(0, MAX_STANCES)
    .map((ranked) => ranked.stance)
    .sort((a, b) => a.score - b.score);
}

function clamp(percent: number): number {
  return Math.min(100 - EDGE, Math.max(EDGE, percent));
}

const styles = StyleSheet.create({
  compass: {
    backgroundColor: colors.inset,
    borderRadius: radius.track,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  poleLabel: {
    fontWeight: '700',
    color: '#6881A1',
  },
  compassMiddle: {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
  },
  plot: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  sideLabel: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabelText: {
    width: SIDE_LABEL,
    textAlign: 'center',
    fontWeight: '700',
    color: '#6881A1',
    transform: [{ rotate: '-90deg' }],
  },
  axisVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.textCaption,
  },
  axisHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.textCaption,
  },
  marker: {
    position: 'absolute',
    width: 140,
    alignItems: 'center',
    marginLeft: -70,
    marginTop: -DOT / 2,
  },
  markerLabel: {
    color: colors.textTitle,
    marginBottom: 2,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: 999,
  },
  stances: {
    gap: spacing.md,
  },
  stancesSpaced: {
    marginTop: spacing.lg,
  },
  stanceRow: {
    gap: 2,
  },
  stanceTopic: {
    fontWeight: '700',
    color: '#333F4F',
  },
  railRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  /**
   * No fixed width: "Rechts" is wider than 38pt at 12pt type and was breaking
   * onto a second line. Both words are constants, so letting them size to their
   * content still leaves every rail in the column aligned.
   */
  railEnd: {
    flexShrink: 0,
    color: '#6881A1',
  },
  railEndRight: {
    textAlign: 'right',
  },
  rail: {
    flex: 1,
    height: RAIL,
    borderRadius: 999,
    backgroundColor: colors.rail,
    justifyContent: 'center',
  },
  stanceDot: {
    position: 'absolute',
    width: STANCE_DOT,
    height: STANCE_DOT,
    borderRadius: 999,
    marginLeft: -STANCE_DOT / 2,
  },
});
