import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
};

/**
 * The coral dropdown controls: "Themen ⌄", "Parteien ⌄", "Filter ⌄".
 *
 * Despite the name these are 12pt rounded rectangles, not pills — the Figma is
 * explicit about it (41pt tall, radius 12). For the small round-ish party and
 * topic chips see `Chip`.
 */
export function FilterPill({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
      <Text style={typography.pillLabel} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={16} color={colors.onAccent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    height: 41,
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
