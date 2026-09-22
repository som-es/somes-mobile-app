import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TopicChip } from '@/components/profile/topic-chip';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { UniqueTopic } from '@/types';

type Props = {
  title: string;
  topics: UniqueTopic[];
  selectedIds: Set<string>;
  onToggle: (topic: UniqueTopic) => void;
  onToggleAll: (topics: UniqueTopic[], select: boolean) => void;
};

/** the select all box is tri state and must not also expand the row */
export function TopicAccordion({ title, topics, selectedIds, onToggle, onToggleAll }: Props) {
  const { t } = useTranslation('profile');
  const [open, setOpen] = useState(false);

  const selectedCount = topics.filter((topic) => selectedIds.has(topic.id)).length;
  const all = selectedCount === topics.length;
  const some = selectedCount > 0 && !all;

  return (
    <View style={styles.group}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.header, open && styles.headerOpen, pressed && styles.pressed]}>
        <Pressable
          onPress={() => onToggleAll(topics, !all)}
          hitSlop={10}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: all }}
          accessibilityLabel={t('topicAccordion.toggleAllA11y', {
            title,
            action: all ? t('topicAccordion.deselectAll') : t('topicAccordion.selectAll'),
          })}
          style={[styles.box, (all || some) && styles.boxActive]}>
          {all ? <Ionicons name="checkmark" size={13} color={colors.onAccent} /> : null}
          {some ? <View style={styles.dash} /> : null}
        </Pressable>

        <Text style={[typography.cardTitle, styles.title]} numberOfLines={1}>
          {title}
        </Text>

        <Text style={typography.caption}>
          {selectedCount > 0 ? `${selectedCount}/${topics.length}` : topics.length}
        </Text>

        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          {topics.map((topic) => (
            <TopicChip
              key={topic.id}
              label={topic.topic}
              selected={selectedIds.has(topic.id)}
              onPress={() => onToggle(topic)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.inset,
  },
  headerOpen: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.inputBorder,
  },
  title: {
    flex: 1,
  },
  box: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardRaised,
  },
  boxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dash: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onAccent,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.inset,
  },
  pressed: {
    opacity: 0.7,
  },
});
