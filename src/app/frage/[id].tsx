import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { QuestionRecipient } from '@/components/cards/question-recipient';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DetailScreen } from '@/components/detail/detail-screen';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { MOCK_QUESTIONS, mockQuestionById } from '@/lib/mock-questions';
import { somes } from '@/lib/somes';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { PublicDelegateQuestion } from '@/types';

export default function FrageDetailScreen() {
  const { t } = useTranslation('questions');
  const { id } = useLocalSearchParams<{ id: string }>();
  // mock ids are negative, so a real question opened while mocking still loads
  const mocked = MOCK_QUESTIONS && Number(id) < 0;

  const question = useQuery({
    queryKey: ['delegate-question', id, mocked],
    queryFn: () =>
      mocked ? Promise.resolve(mockQuestionById(Number(id))) : somes.delegateQuestions.byId(Number(id)),
  });

  return (
    <DetailScreen>
      {question.isPending ? (
        <CardSkeleton />
      ) : question.isError ? (
        <Notice message={t('detail.loadError')} />
      ) : (
        <QuestionDetail question={question.data} />
      )}
    </DetailScreen>
  );
}

function QuestionDetail({ question }: { question: PublicDelegateQuestion }) {
  const { t } = useTranslation('questions');
  const locale = useLocale();

  return (
    <>
      <View style={styles.metaRow}>
        <Ionicons name="person-circle-outline" size={18} color={colors.textMuted} />
        <Text style={typography.subtitle}>
          {t('detail.askedBy', { date: isoToDotDate(question.created_at_date, locale) })}
        </Text>
      </View>

      <Text style={typography.detailTitle}>{question.subject}</Text>
      <Text style={typography.body}>{question.body}</Text>

      {question.topics.length > 0 ? (
        <View style={styles.tags}>
          {question.topics.map((topic) => (
            <Badge key={topic.id} label={topic.topic} />
          ))}
        </View>
      ) : null}

      <QuestionRecipient delegateId={question.delegate_id} size={40} />

      <Text style={[typography.sectionTitle, styles.answersTitle]}>{t('detail.answersHeading')}</Text>

      {question.answers.length === 0 ? (
        <Notice message={t('detail.noAnswers')} />
      ) : (
        question.answers.map((answer, index) => (
          <Card key={index}>
            <Text style={typography.caption}>{isoToDotDate(answer.received_at, locale)}</Text>
            <Text style={[typography.body, styles.answerBody]}>{answer.body}</Text>
          </Card>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  answersTitle: {
    marginTop: spacing.sm,
  },
  answerBody: {
    marginTop: spacing.xs,
  },
});
