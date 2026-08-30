import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string | null;
};

export function TextField({ label, error, hint, style, ...input }: Props) {
  return (
    <View style={styles.group}>
      <Text style={typography.cardTitle}>{label}</Text>

      <TextInput
        placeholderTextColor={colors.textPlaceholder}
        style={[styles.field, typography.subtitle, styles.value, !!error && styles.fieldError, style]}
        {...input}
      />

      {error ? (
        <Text style={[typography.caption, styles.error]}>{error}</Text>
      ) : hint ? (
        <Text style={typography.caption}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  field: {
    height: 41,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.control,
    backgroundColor: colors.cardRaised,
    paddingHorizontal: spacing.md,
  },
  value: {
    color: colors.textTitle,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
  },
});
