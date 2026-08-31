import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
};

/** for features whose backend does not exist yet, so nothing pretends to work */
export function ComingSoon({ icon, title, description }: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={[typography.cardHeading, styles.centered]}>{title}</Text>
      <Text style={[typography.bodyMuted, styles.centered]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.card,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: radius.badge,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inset,
  },
  centered: {
    textAlign: 'center',
  },
});
