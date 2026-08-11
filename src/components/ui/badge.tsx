import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  label: string;
  /** Override the peach fill, e.g. with a party colour. */
  color?: string;
  textColor?: string;
};

/** The peach metadata chip: "einfache Mehrheit", "XXVIII", "02.12.2025". */
export function Badge({ label, color, textColor }: Props) {
  return (
    <View style={[styles.badge, color ? { backgroundColor: color } : null]}>
      <Text style={[typography.badge, textColor ? { color: textColor } : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 24,
    justifyContent: 'center',
    backgroundColor: colors.badge,
    borderRadius: radius.badge,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
});
