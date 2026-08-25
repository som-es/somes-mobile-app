import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Adds an × to a selected chip, for the "your interests" summary row. */
  removable?: boolean;
};

/**
 * A topic in the interest picker.
 *
 * Taller than the shared 22pt `Chip`: there, a chip is a label that happens to
 * be tappable, here it *is* the control, and 22pt is half the 44pt minimum
 * target. Same palette, so it still reads as the same family.
 */
export function TopicChip({ label, selected, onPress, removable = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={selected && removable ? `${label} entfernen` : label}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[styles.label, selected ? styles.selectedLabel : styles.unselectedLabel]}
        numberOfLines={1}>
        {label}
      </Text>
      {selected && removable ? (
        <Ionicons name="close" size={13} color={colors.onAccent} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 30,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    borderRadius: radius.chip,
  },
  selected: {
    backgroundColor: colors.chipSelected,
  },
  unselected: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '400',
  },
  selectedLabel: {
    color: colors.onAccent,
  },
  unselectedLabel: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
});
