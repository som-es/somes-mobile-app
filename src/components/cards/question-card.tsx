import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SectionLink } from '@/components/ui/section-link';
import { isoToDotDate } from '@/lib/date';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { PublicDelegateQuestion } from '@/types';

type Props = {
  question: PublicDelegateQuestion;
};

/** the asker is deliberately anonymous on the wire (no public username field
    exists), so every card shows the same generic "Bürger:in" placeholder */
export function QuestionCard({ question }: Props) {
  const router = useRouter();
  const answer = question.answers[0];

  const openDetail = () =>
    router.push({ pathname: '/frage/[id]', params: { id: String(question.id) } });

  return (
    <Card onPress={openDetail}>
      <View style={styles.metaRow}>
        <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
        <Text style={typography.caption}>
          Bürger:in · {isoToDotDate(question.created_at_date)}
        </Text>
      </View>

      <Text style={[typography.cardTitle, styles.subject]} numberOfLines={2}>
        {question.subject}
      </Text>
      <Text style={typography.body} numberOfLines={2}>
        {question.body}
      </Text>

      {answer ? (
        <View style={styles.answer}>
          <Text style={typography.subtitle}>Antwort</Text>
          <Text style={typography.body} numberOfLines={2}>
            {answer.body}
          </Text>
        </View>
      ) : (
        <Text style={[typography.bodyMuted, styles.unanswered]}>Noch keine Antwort</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.tags}>
          {question.topics.map((topic) => (
            <Badge key={topic.id} label={topic.topic} />
          ))}
        </View>
        <SectionLink label="Weiterlesen" onPress={openDetail} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subject: {
    marginTop: spacing.sm,
  },
  answer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  unanswered: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
