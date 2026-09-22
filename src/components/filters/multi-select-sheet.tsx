import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SearchField } from '@/components/ui/search-field';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  visible: boolean;
  title: string;
  values: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onClose: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function MultiSelectSheet({
  visible,
  title,
  values,
  selected,
  onChange,
  onClose,
  searchable = false,
  searchPlaceholder,
}: Props) {
  const { t } = useTranslation('filters');
  const [search, setSearch] = useState('');

  const shown = useMemo(() => {
    if (!search) return values;
    const needle = search.toLowerCase();
    return values.filter((value) => value.toLowerCase().includes(needle));
  }, [values, search]);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value]
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      onReset={selected.length > 0 ? () => onChange([]) : undefined}>
      {searchable ? (
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder ?? t('common:search.placeholder')}
          filled
        />
      ) : null}

      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {shown.length === 0 ? (
          <Text style={[typography.bodyMuted, styles.empty]}>{t('noResults')}</Text>
        ) : (
          shown.map((value) => {
            const isSelected = selected.includes(value);
            return (
              <Pressable
                key={value}
                onPress={() => toggle(value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                <View style={[styles.box, isSelected && styles.boxChecked]}>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color={colors.onAccent} />
                  ) : null}
                </View>
                <Text style={[typography.subtitle, styles.label]}>{value}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  /** bounded so the sheet still has room for the apply button */
  list: {
    maxHeight: 380,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  box: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardRaised,
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    flex: 1,
    color: colors.textTitle,
  },
  empty: {
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
});
