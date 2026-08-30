import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, shadows } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

type Variant = 'filled' | 'outlined';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  /** `filled` is the blue-grey list card, `outlined` the white profile one. */
  variant?: Variant;
  /** Person rows use a heavier shadow than content cards. */
  elevation?: keyof typeof shadows;
  style?: ViewStyle;
};

export function Card({
  children,
  onPress,
  variant = 'filled',
  elevation = 'card',
  style,
}: Props) {
  const cardStyle = [
    styles.card,
    shadows[elevation],
    variant === 'outlined' && styles.outlined,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.card,
  },
  outlined: {
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  /** A slight give rather than a blink — the card is a big target. */
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
