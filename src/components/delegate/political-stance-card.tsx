import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SectionCard } from '@/components/detail/section-card';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useTopicGroupLookup } from '@/lib/use-topic-group-lookup';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { topicColor } from '@/theme/topic-colors';
import { topicGroupLabel } from '@/theme/topic-group-labels';
import { typography } from '@/theme/typography';
import type { InterestShare, PoliticalPosition, StanceTopicScore } from '@/types';

/** share of the plot per unit of score, 400 fits the normalised scores of about 0.3,
    at the old scale every member ends up dead centre */
const PERCENT_PER_UNIT = (800 / 200) * 100;
/** keep an off the chart score inside the frame instead of clipping it */
const EDGE = 6;

const DOT = 14;
const STANCE_DOT = 16;
const RAIL = 6;
const SIDE_LABEL = 120;
/** the web keeps the eight topics the member speaks about most */
const MAX_STANCES = 8;

type Props = {
  delegateId: number;
  name: string;
  party: string | null;
  position: PoliticalPosition | null;
  stances: StanceTopicScore[];
  interests: InterestShare[];
};

export function PoliticalStanceCard({
  delegateId,
  name,
  party,
  position,
  stances,
  interests,
}: Props) {
  const { t } = useTranslation('delegates');
  const partyColor = usePartyColor(party);
  const { resolve } = useTopicGroupLookup(delegateId);
  const ranked = rankStances(stances, interests);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!position && ranked.length === 0) return null;

  return (
    <>
      <SectionCard
        title={t('stance.title')}
        action={
          <Pressable
            onPress={() => setInfoOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('stance.infoButtonLabel')}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </Pressable>
        }>
        {position ? <Compass name={name} color={partyColor} position={position} /> : null}
        {ranked.length > 0 ? (
          <StanceRails stances={ranked} hasCompass={!!position} resolve={resolve} />
        ) : null}
      </SectionCard>

      <BottomSheet
        visible={infoOpen}
        title={t('stance.title')}
        onClose={() => setInfoOpen(false)}
        applyLabel={t('common:bottomSheet.close')}>
        <Text style={typography.bodyMuted}>{t('stance.infoDisclaimer')}</Text>
      </BottomSheet>
    </>
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
  const { t } = useTranslation('delegates');
  // positive x leans capitalist, positive y authoritarian, screen y grows downwards
  const { socialist, capitalist, liberal, authoritarian } = position.total_score;
  const x = clamp(50 + (capitalist - socialist) * PERCENT_PER_UNIT);
  const y = clamp(50 - (authoritarian - liberal) * PERCENT_PER_UNIT);

  return (
    <View style={styles.compass}>
      <Text style={[typography.caption, styles.poleLabel]}>{t('stance.authoritarian')}</Text>

      <View style={styles.compassMiddle}>
        <SideLabel label={t('stance.socialist')} />

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

        <SideLabel label={t('stance.capitalist')} />
      </View>

      <Text style={[typography.caption, styles.poleLabel]}>{t('stance.libertarian')}</Text>
    </View>
  );
}

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
  resolve,
}: {
  stances: StanceTopicScore[];
  hasCompass: boolean;
  resolve: (topicId: string, fallbackTopicName: string) => string;
}) {
  const { t } = useTranslation('delegates');

  return (
    <View style={[styles.stances, hasCompass && styles.stancesSpaced]}>
      {stances.map((stance) => {
        // the web maps a score of -0.5 to 0.5 across the full rail
        const at = clamp((stance.score * 2 + 1) * 50);
        const group = resolve(stance.topic_id, stance.topic);

        return (
          <View key={stance.topic_id} style={styles.stanceRow}>
            <Text style={[typography.subtitle, styles.stanceTopic]} numberOfLines={1}>
              {topicGroupLabel(t, group)}
            </Text>

            <View style={styles.railRow}>
              <Text style={[typography.caption, styles.railEnd]} numberOfLines={1}>
                {t('stance.left')}
              </Text>

              <View style={styles.rail}>
                <View
                  style={[styles.stanceDot, { left: `${at}%`, backgroundColor: topicColor(group) }]}
                />
              </View>

              <Text
                style={[typography.caption, styles.railEnd, styles.railEndRight]}
                numberOfLines={1}>
                {t('stance.right')}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** matches by topic_id rather than the (possibly translated) topic name, so an
    interest and a stance on the same topic still pair up correctly regardless
    of UI language */
function rankStances(stances: StanceTopicScore[], interests: InterestShare[]) {
  return stances
    .map((stance) => ({
      stance,
      occurences:
        interests.find((interest) => interest.topic_id === stance.topic_id)?.occurences ?? 0,
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
