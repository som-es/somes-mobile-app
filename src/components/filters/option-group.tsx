import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export type Option<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  title: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function OptionGroup<T>({ title, options, value, onChange }: Props<T>) {
  return (
    <View style={styles.group}>
      <Text style={typography.caption}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}>
              <Text style={[typography.badge, selected && styles.selectedLabel]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.control,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectedLabel: {
    color: colors.onAccent,
  },
  pressed: {
    opacity: 0.7,
  },
});
