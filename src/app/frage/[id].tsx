import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DetailScreen } from '@/components/detail/detail-screen';
import { Notice } from '@/components/ui/notice';
import { CardSkeleton } from '@/components/ui/skeleton';
import { isoToDotDate } from '@/lib/date';
import { delegateAvatarUrl, somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate, PublicDelegateQuestion } from '@/types';

export default function FrageDetailScreen() {
  const { t } = useTranslation('questions');
  const { id } = useLocalSearchParams<{ id: string }>();

  const question = useQuery({
    queryKey: ['delegate-question', id],
    queryFn: () => somes.delegateQuestions.byId(Number(id)),
  });

  const delegate = useQuery({
    queryKey: ['delegate', question.data?.delegate_id],
    queryFn: () => somes.delegates.byId(question.data!.delegate_id),
    enabled: !!question.data,
  });

  return (
    <DetailScreen>
      {question.isPending ? (
        <CardSkeleton />
      ) : question.isError ? (
        <Notice message={t('detail.loadError')} />
      ) : (
        <QuestionDetail question={question.data} delegate={delegate.data} />
      )}
    </DetailScreen>
  );
}

function QuestionDetail({
  question,
  delegate,
}: {
  question: PublicDelegateQuestion;
  delegate: Delegate | undefined;
}) {
  const { t } = useTranslation('questions');
  const locale = useLocale();
  const country = useCountry();

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

      {delegate ? (
        <View style={styles.recipientRow}>
          <Image
            source={{ uri: delegateAvatarUrl(country, delegate.id, delegate.image_url) }}
            style={styles.avatar}
            accessibilityLabel={delegate.name}
          />
          <View>
            <Text style={typography.caption}>{t('detail.askedLabel')}</Text>
            <Text style={typography.cardTitle}>
              {delegate.name} · {delegate.party}
            </Text>
          </View>
        </View>
      ) : null}

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
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  answersTitle: {
    marginTop: spacing.sm,
  },
  answerBody: {
    marginTop: spacing.xs,
  },
});
