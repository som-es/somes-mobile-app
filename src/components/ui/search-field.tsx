import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  filled?: boolean;
};

export function SearchField({ value, onChangeText, placeholder, filled = false }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.field, filled && styles.filled]}>
      <Ionicons name="search" size={16} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common:search.placeholder')}
        placeholderTextColor={colors.textPlaceholder}
        style={[styles.input, typography.subtitle, styles.inputColor]}
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 41,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
  },
  filled: {
    backgroundColor: colors.cardRaised,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  inputColor: {
    color: colors.textTitle,
  },
});
