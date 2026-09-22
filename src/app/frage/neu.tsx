import Ionicons from '@expo/vector-icons/Ionicons';
import { ApiError } from '@som-es/somes-ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { withCount } from '@/components/lists/filter-sources';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { SubScreen } from '@/components/layout/sub-screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterPill } from '@/components/ui/filter-pill';
import { Notice } from '@/components/ui/notice';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { TextField } from '@/components/ui/text-field';
import { delegateAvatarUrl, isAuthError, somes } from '@/lib/somes';
import { useAuth } from '@/lib/use-auth';
import { useCountry } from '@/lib/use-country';
import { useDebounced } from '@/lib/use-debounced';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate } from '@/types';

const SUBJECT_MAX = 255;
const BODY_MAX = 10000;

export default function FrageNeuScreen() {
  const { t } = useTranslation('questions');
  const router = useRouter();
  const country = useCountry();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ delegateId?: string }>();

  const preselected = useQuery({
    queryKey: ['delegate', params.delegateId],
    queryFn: () => somes.delegates.byId(Number(params.delegateId)),
    enabled: !!params.delegateId,
  });

  const [pickedDelegate, setPickedDelegate] = useState<Delegate | null>(null);
  const delegate = params.delegateId ? (preselected.data ?? null) : pickedDelegate;

  if (!isAuthenticated) {
    return (
      <SubScreen>
        <ScreenTitle title={t('askButton')} />
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>{t('compose.signedOut.heading')}</Text>
          <Text style={typography.bodyMuted}>{t('compose.signedOut.body')}</Text>
          <Button
            label={t('compose.signedOut.signIn')}
            onPress={() => router.push('/anmelden')}
            size="lg"
          />
        </Card>
      </SubScreen>
    );
  }

  if (country !== 'at') {
    return (
      <SubScreen>
        <ScreenTitle title={t('askButton')} />
        <Notice message={t('notAvailableForEu')} />
      </SubScreen>
    );
  }

  if (!delegate) {
    return <DelegatePicker onPick={setPickedDelegate} />;
  }

  return <ComposeQuestion delegate={delegate} />;
}

function DelegatePicker({ onPick }: { onPick: (delegate: Delegate) => void }) {
  const { t } = useTranslation('questions');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const country = useCountry();

  const results = useQuery({
    queryKey: ['delegate-picker', debouncedSearch],
    queryFn: () =>
      somes.delegates.search({
        page: 1,
        entriesPerPage: 20,
        name: debouncedSearch || null,
        hasActiveMandate: true,
      }),
  });

  return (
    <SubScreen>
      <ScreenTitle title={t('askButton')} subtitle={t('compose.picker.subtitle')} />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('compose.picker.searchPlaceholder')}
      />

      {results.isPending ? null : results.isError ? (
        <Notice message={t('compose.picker.error')} />
      ) : results.data.delegates.length === 0 ? (
        <Notice message={t('compose.picker.empty')} />
      ) : (
        <View style={styles.pickerList}>
          {results.data.delegates.map((delegate) => (
            <Card key={delegate.id} elevation="row" onPress={() => onPick(delegate)}>
              <View style={styles.pickerRow}>
                <Image
                  source={{ uri: delegateAvatarUrl(country, delegate.id, delegate.image_url) }}
                  style={styles.avatar}
                  accessibilityLabel={delegate.name}
                />
                <View style={styles.pickerName}>
                  <Text style={typography.rowTitle}>{delegate.name}</Text>
                  <Text style={typography.rowMeta}>{delegate.party}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      )}
    </SubScreen>
  );
}

function ComposeQuestion({ delegate }: { delegate: Delegate }) {
  const { t } = useTranslation('questions');
  const router = useRouter();
  const country = useCountry();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicSheetOpen, setTopicSheetOpen] = useState(false);

  const eurovocTopics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: () => somes.reference.eurovocTopics(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const topicIdByLabel = useMemo(
    () => new Map((eurovocTopics.data ?? []).map((topic) => [topic.topic, topic.id])),
    [eurovocTopics.data]
  );
  const topicIds = useMemo(
    () => selectedTopics.map((label) => topicIdByLabel.get(label)).filter((id): id is string => !!id),
    [selectedTopics, topicIdByLabel]
  );

  const recipient = useQuery({
    queryKey: ['question-recipient', delegate.id],
    queryFn: () => somes.delegateQuestions.recipient(delegate.id),
  });

  const ask = useMutation({
    mutationFn: () =>
      somes.delegateQuestions.ask(delegate.id, {
        subject: subject.trim(),
        body: body.trim(),
        eurovoc_topic_ids: topicIds,
      }),
  });

  if (ask.isSuccess) {
    return (
      <SubScreen>
        <ScreenTitle title={t('compose.success.title')} />
        <Notice message={t('compose.success.message')} />
        <Button
          label={t('compose.success.backToOverview')}
          onPress={() => router.replace('/(tabs)/fragen')}
          size="lg"
        />
      </SubScreen>
    );
  }

  const canSubmit = subject.trim().length > 0 && body.trim().length > 0 && !ask.isPending;

  return (
    <SubScreen>
      <ScreenTitle title={t('askButton')} />

      <View style={styles.recipientRow}>
        <Image
          source={{ uri: delegateAvatarUrl(country, delegate.id, delegate.image_url) }}
          style={styles.avatar}
          accessibilityLabel={delegate.name}
        />
        <View style={styles.pickerName}>
          <Text style={typography.rowTitle}>{delegate.name}</Text>
          {recipient.data ? (
            <Text style={typography.caption}>
              {recipient.data.delivery === 'party'
                ? t('compose.form.viaClub', { recipientName: recipient.data.recipient_name })
                : t('compose.form.direct', { recipientName: recipient.data.recipient_name })}
            </Text>
          ) : null}
        </View>
      </View>

      <TextField
        label={t('compose.form.subjectLabel')}
        value={subject}
        onChangeText={setSubject}
        maxLength={SUBJECT_MAX}
        placeholder={t('compose.form.subjectPlaceholder')}
      />

      <TextField
        label={t('compose.form.bodyLabel')}
        value={body}
        onChangeText={setBody}
        maxLength={BODY_MAX}
        placeholder={t('compose.form.bodyPlaceholder')}
        multiline
        style={styles.bodyField}
      />

      <FilterPill
        label={
          selectedTopics.length > 0
            ? withCount(t('topicsSheet.title'), selectedTopics.length)
            : t('compose.form.topicsSelect')
        }
        onPress={() => setTopicSheetOpen(true)}
      />

      {ask.isError ? <Notice message={messageFor(ask.error, t)} /> : null}

      <Button
        label={t('compose.form.submit')}
        onPress={() => ask.mutate()}
        disabled={!canSubmit}
        loading={ask.isPending}
        size="lg"
      />

      <MultiSelectSheet
        visible={topicSheetOpen}
        title={t('topicsSheet.title')}
        values={[...topicIdByLabel.keys()]}
        selected={selectedTopics}
        onChange={setSelectedTopics}
        onClose={() => setTopicSheetOpen(false)}
        searchable
        searchPlaceholder={t('topicsSheet.searchPlaceholder')}
      />
    </SubScreen>
  );
}

function messageFor(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    if (error.status === 503) {
      return t('compose.errors.unavailable');
    }
    if (isAuthError(error)) {
      return t('compose.errors.reauth');
    }
    return t('compose.errors.submitFailed');
  }
  return t('compose.errors.network');
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  pickerList: {
    gap: spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerName: {
    flex: 1,
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
  bodyField: {
    height: 160,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
});
