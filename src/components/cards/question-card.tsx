import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SectionLink } from '@/components/ui/section-link';
import { isoToDotDate } from '@/lib/date';
import { useLocale } from '@/lib/use-locale';
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
  const { t } = useTranslation('questions');
  const locale = useLocale();
  const router = useRouter();
  const answer = question.answers[0];

  const openDetail = () =>
    router.push({ pathname: '/frage/[id]', params: { id: String(question.id) } });

  return (
    <Card onPress={openDetail}>
      <View style={styles.metaRow}>
        <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
        <Text style={typography.caption}>
          {t('detail.askedBy', { date: isoToDotDate(question.created_at_date, locale) })}
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
          <Text style={typography.subtitle}>{t('card.answerLabel')}</Text>
          <Text style={typography.body} numberOfLines={2}>
            {answer.body}
          </Text>
        </View>
      ) : (
        <Text style={[typography.bodyMuted, styles.unanswered]}>{t('card.noAnswerYet')}</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.tags}>
          {question.topics.map((topic) => (
            <Badge key={topic.id} label={topic.topic} />
          ))}
        </View>
        <SectionLink label={t('card.readMore')} onPress={openDetail} />
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
