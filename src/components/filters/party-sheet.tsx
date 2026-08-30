import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { PartyVote } from '@/types';

type Props = {
  visible: boolean;
  /** Already sorted by fraction descending by the caller. */
  parties: { name: string; color: string | null }[];
  selected: PartyVote[];
  onChange: (selected: PartyVote[]) => void;
  onClose: () => void;
};

type Stance = 'pro' | 'egal' | 'contra';

const STANCES: { value: Stance; label: string }[] = [
  { value: 'pro', label: 'Pro' },
  { value: 'egal', label: 'Egal' },
  { value: 'contra', label: 'Contra' },
];

/** Tri-state per party. "Egal" drops the party from the filter entirely. */
export function PartySheet({ visible, parties, selected, onChange, onClose }: Props) {
  function stanceOf(party: string): Stance {
    const match = selected.find((entry) => entry.party === party);
    if (!match) return 'egal';
    return match.infavor ? 'pro' : 'contra';
  }

  function setStance(party: string, stance: Stance) {
    const without = selected.filter((entry) => entry.party !== party);
    onChange(stance === 'egal' ? without : [...without, { party, infavor: stance === 'pro' }]);
  }

  return (
    <BottomSheet
      visible={visible}
      title="Parteien"
      onClose={onClose}
      onReset={selected.length > 0 ? () => onChange([]) : undefined}>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {parties.map((party) => {
          const stance = stanceOf(party.name);
          return (
            <View key={party.name} style={styles.row}>
              <View style={styles.identity}>
                <View
                  style={[styles.dot, { backgroundColor: party.color ?? colors.textMuted }]}
                />
                <Text style={[typography.rowTitle, styles.name]} numberOfLines={1}>
                  {party.name}
                </Text>
              </View>

              <View style={styles.stances}>
                {STANCES.map((option) => {
                  const active = option.value === stance;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setStance(party.name, option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.stance,
                        active && styles.stanceActive,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[typography.badge, active && styles.stanceActiveLabel]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: 380,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  name: {
    flexShrink: 1,
  },
  stances: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stance: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.thumb,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  stanceActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stanceActiveLabel: {
    color: colors.onAccent,
  },
  pressed: {
    opacity: 0.7,
  },
});
