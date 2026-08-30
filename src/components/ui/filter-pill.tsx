import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
};

export function FilterPill({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
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
