import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { Locale } from '@/lib/locale';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

const OPTIONS: { value: Locale; titleKey: string; captionKey: string }[] = [
  { value: 'de-AT', titleKey: 'common:languageSheet.deAT.title', captionKey: 'common:languageSheet.deAT.caption' },
  { value: 'en-GB', titleKey: 'common:languageSheet.enGB.title', captionKey: 'common:languageSheet.enGB.caption' },
];

type Props = {
  visible: boolean;
  value: Locale;
  onChange: (locale: Locale) => void;
  onClose: () => void;
};

export function LanguageSheet({ visible, value, onChange, onClose }: Props) {
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
      title={t('common:languageSheet.title')}
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
              <View style={styles.icon}>
                <Ionicons name="language-outline" size={22} color={colors.accent} />
              </View>
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.thumb,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.screen,
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
