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
      <Ionicons name="filter-outline" size={16} color={colors.textMuted} />
      <Text
        style={[typography.pillLabel, styles.label]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
  },
  label: {
    flexShrink: 1,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
});
