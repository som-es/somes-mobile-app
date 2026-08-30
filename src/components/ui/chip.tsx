import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
  color?: string;
  selected?: boolean;
  dimmed?: boolean;
};

export function Chip({ label, onPress, color, selected = true, dimmed = false }: Props) {
  const filled = color !== undefined || selected;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        filled
          ? { backgroundColor: color ?? colors.chipSelected }
          : styles.unselected,
        dimmed && styles.dimmed,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[typography.chip, !filled && styles.unselectedLabel]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 22,
    justifyContent: 'center',
    borderRadius: radius.chip,
    paddingHorizontal: spacing.sm,
    /** some eurovoc topics are long, keep one from overflowing a wrapped row */
    maxWidth: '100%',
  },
  unselected: {
    backgroundColor: colors.cardRaised,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.inputBorder,
  },
  unselectedLabel: {
    color: colors.textCaption,
  },
  dimmed: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
});
