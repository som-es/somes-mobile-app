import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Variant = 'accent' | 'danger' | 'ghost';
type Size = 'sm' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'accent',
  size = 'sm',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const inert = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'lg' ? styles.lg : styles.sm,
        styles[variant],
        inert && styles.inert,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? colors.text : colors.onAccent} />
      ) : (
        <Text
          style={[typography.button, styles[`${variant}Label`], size === 'lg' && styles.lgLabel]}
          numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 'auto',
  },
  sm: {
    height: 31,
    alignSelf: 'flex-start',
  },
  lg: {
    height: 44,
  },
  lgLabel: {
    fontWeight: '600',
  },
  accent: {
    backgroundColor: colors.accent,
  },
  accentLabel: {
    color: colors.onAccent,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerLabel: {
    color: colors.onAccent,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostLabel: {
    color: colors.text,
  },
  inert: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
});
