import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CountryFlag } from '@/components/ui/country-flag';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Country } from '@/types';

const OPTIONS: { value: Country; titleKey: string; captionKey: string }[] = [
  { value: 'at', titleKey: 'common:country.at.title', captionKey: 'common:country.at.caption' },
  { value: 'eu', titleKey: 'common:country.eu.title', captionKey: 'common:country.eu.caption' },
];

type Props = {
  visible: boolean;
  value: Country;
  onChange: (country: Country) => void;
  onClose: () => void;
};

export function CountrySheet({ visible, value, onChange, onClose }: Props) {
  const { t } = useTranslation();

  /** staged locally, only committed on Apply — closing any other way
      (backdrop tap, drag-to-dismiss, back button) discards the pick */
  const [pending, setPending] = useState(value);
  const [wasVisible, setWasVisible] = useState(visible);

  // re-stage from the committed value each time the sheet opens, so a
  // discarded pick from a previous visit never lingers
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPending(value);
  }

  return (
    <BottomSheet
      visible={visible}
      title={t('common:regionSheet.title')}
      onClose={onClose}
      onApply={() => {
        if (pending !== value) onChange(pending);
      }}>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option.value === pending;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPending(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}>
              <CountryFlag country={option.value} variant="map" size={44} />
              <View style={styles.labels}>
                <Text style={typography.cardTitle}>{t(option.titleKey)}</Text>
                <Text style={typography.caption}>{t(option.captionKey)}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.cardRaised,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selected: {
    borderColor: colors.accent,
  },
  labels: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
});
