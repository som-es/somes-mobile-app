import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TopicChip } from '@/components/profile/topic-chip';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { UniqueTopic } from '@/types';

type Props = {
  visible: boolean;
  topics: UniqueTopic[];
  onRemove: (topic: UniqueTopic) => void;
  onClose: () => void;
};

export function SelectedTopicsSheet({ visible, topics, onRemove, onClose }: Props) {
  const { t } = useTranslation('profile');

  return (
    <BottomSheet visible={visible} title={t('selectedTopicsSheet.title')} onClose={onClose}>
      {topics.length === 0 ? (
        <Text style={typography.bodyMuted}>{t('selectedTopicsSheet.empty')}</Text>
      ) : (
        <>
          <Text style={typography.caption}>{t('selectedTopicsSheet.hint')}</Text>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            <View style={styles.chips}>
              {topics.map((topic) => (
                <TopicChip
                  key={topic.id}
                  label={topic.topic}
                  selected
                  removable
                  onPress={() => onRemove(topic)}
                />
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  /** bounded so the sheet still has room for the apply button */
  list: {
    maxHeight: 340,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
