import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** The stripe the Figma draws by peeking a coloured rect out from behind. */
const STRIPE = 4;

export function opinionColor(infavor: boolean | null): string {
  if (infavor === null) return colors.voteNone;
  return infavor ? colors.voteYes : colors.voteNo;
}

type CardProps = {
  /** How the member voted or spoke — drives the stripe colour. */
  infavor: boolean | null;
  onPress?: () => void;
  children: ReactNode;
};

export function OpinionCard({ infavor, onPress, children }: CardProps) {
  const body = <View style={styles.body}>{children}</View>;

  return (
    <View style={[styles.card, { borderLeftColor: opinionColor(infavor) }]}>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
          {body}
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

/** The "● Pro  ● Contra" key the design puts beside both section titles. */
export function OpinionLegend() {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.voteYes }]} />
        <Text style={typography.caption}>Pro</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: colors.voteNo }]} />
        <Text style={typography.caption}>Contra</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.inset,
    borderRadius: radius.track,
    borderLeftWidth: STRIPE,
    overflow: 'hidden',
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
