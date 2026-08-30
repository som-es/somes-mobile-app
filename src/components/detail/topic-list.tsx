import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { DbAiSummary } from '@/types/ai-summary';
import type { Topic } from '@/types';

import { SectionCard } from './section-card';

type Props = {
  topics: string[];
};

export function TopicList({ topics }: Props) {
  return (
    <SectionCard title="Themen">
      <View style={styles.list}>
        {topics.map((topic) => (
          <View key={topic} style={styles.row}>
            <Text style={typography.bodyMuted}>{'•'}</Text>
            <Text style={[typography.bodyMuted, styles.label]}>{topic}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

export function topicNames(eurovoc: Topic[], aiSummary: DbAiSummary | null): string[] {
  const names =
    eurovoc.length > 0
      ? eurovoc.map((topic) => topic.topic)
      : (aiSummary?.full_summary?.topics ?? []);
  return names.slice().sort((a, b) => a.length - b.length);
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
});
