import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { spacing } from '@/theme/layout';
import type { DbAiSummary, Topic } from '@/types';

import { SectionCard } from './section-card';

type Props = {
  topics: string[];
};

export function TopicList({ topics }: Props) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('common:detail.topics')}>
      <View style={styles.list}>
        {topics.map((topic) => (
          <Badge key={topic} label={topic} />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
