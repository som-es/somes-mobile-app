import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
  return (
    <BottomSheet visible={visible} title="Deine Interessen" onClose={onClose}>
      {topics.length === 0 ? (
        <Text style={typography.bodyMuted}>Noch keine Interessen ausgewählt.</Text>
      ) : (
        <>
          <Text style={typography.caption}>Zum Entfernen antippen.</Text>
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
  /** Bounded so the sheet's own max height still leaves room for "Anwenden". */
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
