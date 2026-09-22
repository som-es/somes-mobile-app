import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  grow: boolean;
};

export function FilterPill({ label, onPress, disabled = false, grow = false, }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pill,
        disabled && styles.disabled,
        pressed && styles.pressed,
        grow && styles.growStyle,
      ]}>
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
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
  growStyle: {
    flexGrow: 1.0,
  },
});
