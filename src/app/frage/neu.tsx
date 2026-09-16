import Ionicons from '@expo/vector-icons/Ionicons';
import { ApiError } from '@som-es/somes-ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

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
        <ScreenTitle title="Frage stellen" />
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>Melde dich an</Text>
          <Text style={typography.bodyMuted}>
            Um einer:m Abgeordneten eine Frage zu stellen, brauchst du ein Konto.
          </Text>
          <Button label="Anmelden" onPress={() => router.push('/anmelden')} size="lg" />
        </Card>
      </SubScreen>
    );
  }

  if (country !== 'at') {
    return (
      <SubScreen>
        <ScreenTitle title="Frage stellen" />
        <Notice message="Fragen an Abgeordnete sind für das EU-Parlament derzeit nicht möglich." />
      </SubScreen>
    );
  }

  if (!delegate) {
    return <DelegatePicker onPick={setPickedDelegate} />;
  }

  return <ComposeQuestion delegate={delegate} />;
}

function DelegatePicker({ onPick }: { onPick: (delegate: Delegate) => void }) {
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
      <ScreenTitle
        title="Frage stellen"
        subtitle="Wähle zuerst die Person aus, die du fragen möchtest."
      />
      <SearchField value={search} onChangeText={setSearch} placeholder="Abgeordnete:n suchen..." />

      {results.isPending ? null : results.isError ? (
        <Notice message="Abgeordnete konnten nicht geladen werden." />
      ) : results.data.delegates.length === 0 ? (
        <Notice message="Keine Abgeordneten gefunden." />
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
        <ScreenTitle title="Frage eingereicht" />
        <Notice message="Deine Frage wurde eingereicht und wird geprüft, bevor sie veröffentlicht wird." />
        <Button label="Zur Übersicht" onPress={() => router.replace('/(tabs)/fragen')} size="lg" />
      </SubScreen>
    );
  }

  const canSubmit = subject.trim().length > 0 && body.trim().length > 0 && !ask.isPending;

  return (
    <SubScreen>
      <ScreenTitle title="Frage stellen" />

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
                ? `Geht an den Klub der ${recipient.data.recipient_name}`
                : `Geht direkt an ${recipient.data.recipient_name}`}
            </Text>
          ) : null}
        </View>
      </View>

      <TextField
        label="Betreff"
        value={subject}
        onChangeText={setSubject}
        maxLength={SUBJECT_MAX}
        placeholder="Worum geht es?"
      />

      <TextField
        label="Deine Frage"
        value={body}
        onChangeText={setBody}
        maxLength={BODY_MAX}
        placeholder="Formuliere deine Frage..."
        multiline
        style={styles.bodyField}
      />

      <FilterPill
        label={
          selectedTopics.length > 0 ? `Themen (${selectedTopics.length})` : 'Themen auswählen'
        }
        onPress={() => setTopicSheetOpen(true)}
      />

      {ask.isError ? <Notice message={messageFor(ask.error)} /> : null}

      <Button label="Frage einreichen" onPress={() => ask.mutate()} disabled={!canSubmit} loading={ask.isPending} size="lg" />

      <MultiSelectSheet
        visible={topicSheetOpen}
        title="Themen"
        values={[...topicIdByLabel.keys()]}
        selected={selectedTopics}
        onChange={setSelectedTopics}
        onClose={() => setTopicSheetOpen(false)}
        searchable
        searchPlaceholder="Thema suchen..."
      />
    </SubScreen>
  );
}

function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 503) {
      return 'Fragen sind für dieses Parlament derzeit nicht möglich.';
    }
    if (isAuthError(error)) {
      return 'Bitte melde dich erneut an.';
    }
    return 'Deine Frage konnte nicht gesendet werden.';
  }
  return 'Keine Verbindung zum Server.';
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
