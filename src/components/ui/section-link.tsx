import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  onPress: () => void;
};

export function SectionLink({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="link"
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <Text style={typography.subtitle}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
});
