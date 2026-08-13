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
      {/* Three pills share a 353pt row, so the longest label — "Ministerien (12)"
          — has about 74pt to live in. `adjustsFontSizeToFit` shrinks it to fit
          instead of clipping it, which is why the label must stay one line. */}
      <Text
        style={[typography.pillLabel, styles.label]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={colors.onAccent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    height: 41,
    backgroundColor: colors.accent,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
  },
  label: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
