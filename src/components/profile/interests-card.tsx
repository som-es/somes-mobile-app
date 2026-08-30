import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { get_eurovoc_topics } from '@/api/api';
import { addUserTopic, getUserTopics, removeUserTopic } from '@/api/authed';
import { isHasError, unwrap } from '@/api/client';
import { SelectedTopicsSheet } from '@/components/profile/selected-topics-sheet';
import { TopicAccordion } from '@/components/profile/topic-accordion';
import { Card } from '@/components/ui/card';
import { SearchField } from '@/components/ui/search-field';
import { useAuth } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { OTHER_GROUP, topicGroup } from '@/theme/topic-groups';
import { typography } from '@/theme/typography';
import type { UniqueTopic } from '@/types';

/** a day, the eurovoc list changes once per legislative period at most */
const STALE = 1000 * 60 * 60 * 24;

/** search hits render inline, so the list has to stay short */
const MAX_RESULTS = 10;

export function InterestsCard() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showSelected, setShowSelected] = useState(false);

  const topics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: async () => unwrap(await get_eurovoc_topics()),
    staleTime: STALE,
  });

  const selection = useQuery({
    queryKey: ['user-topics'],
    queryFn: async () => unwrap(await getUserTopics()),
    enabled: isAuthenticated,
  });

  const selected = useMemo(
    () => (selection.data ?? []).slice().sort((a, b) => a.topic.localeCompare(b.topic, 'de')),
    [selection.data]
  );
  const selectedIds = useMemo(() => new Set(selected.map((topic) => topic.id)), [selected]);

  const toggle = useMutation({
    mutationFn: async ({ topic, select }: { topic: UniqueTopic; select: boolean }) => {
      // only id is read server side, but serde needs the field to be there
      const body: UniqueTopic = { id: topic.id, topic: '' };
      const result = select ? await addUserTopic(body) : await removeUserTopic(body);
      if (isHasError(result)) throw new Error(`${result.error_type}: ${result.error}`);
    },
    onMutate: async ({ topic, select }) => {
      await queryClient.cancelQueries({ queryKey: ['user-topics'] });
      const previous = queryClient.getQueryData<UniqueTopic[]>(['user-topics']);
      queryClient.setQueryData<UniqueTopic[]>(['user-topics'], (current = []) =>
        select
          ? current.some((entry) => entry.id === topic.id)
            ? current
            : [...current, topic]
          : current.filter((entry) => entry.id !== topic.id)
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(['user-topics'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['user-topics'] }),
  });

  function toggleOne(topic: UniqueTopic) {
    toggle.mutate({ topic, select: !selectedIds.has(topic.id) });
  }

  function toggleMany(group: UniqueTopic[], select: boolean) {
    group
      .filter((topic) => selectedIds.has(topic.id) !== select)
      .forEach((topic) => toggle.mutate({ topic, select }));
  }

  const groups = useMemo(() => {
    const byGroup = new Map<string, UniqueTopic[]>();
    (topics.data ?? []).forEach((topic) => {
      const group = topicGroup(topic.topic);
      const bucket = byGroup.get(group);
      if (bucket) bucket.push(topic);
      else byGroup.set(group, [topic]);
    });

    return Array.from(byGroup.entries())
      .map(([title, entries]) => ({
        title,
        topics: entries.slice().sort((a, b) => a.topic.localeCompare(b.topic, 'de')),
      }))
      .sort((a, b) => {
        if (a.title === OTHER_GROUP) return 1;
        if (b.title === OTHER_GROUP) return -1;
        return a.title.localeCompare(b.title, 'de');
      });
  }, [topics.data]);

  const needle = search.trim().toLowerCase();
  const results = useMemo(() => {
    if (!needle) return [];
    const matching = (topics.data ?? []).filter((topic) =>
      topic.topic.toLowerCase().includes(needle)
    );
    // selected first, like on somes.at
    return [
      ...matching.filter((topic) => selectedIds.has(topic.id)),
      ...matching.filter((topic) => !selectedIds.has(topic.id)),
    ];
  }, [topics.data, selectedIds, needle]);

  const loading = topics.isPending || selection.isPending;

  return (
    <Card style={styles.card}>
      <View style={styles.heading}>
        <Text style={[typography.cardHeading, styles.grow]}>Wähle deine Interessen</Text>
        {selected.length > 0 ? (
          <Pressable
            onPress={() => setShowSelected(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${selected.length} ausgewählte Interessen anzeigen`}
            style={({ pressed }) => [styles.count, pressed && styles.pressed]}>
            <Text style={[typography.caption, styles.countLabel]}>
              {selected.length} ausgewählt
            </Text>
            <Ionicons name="chevron-forward" size={13} color={colors.accent} />
          </Pressable>
        ) : null}
      </View>

      <Text style={typography.caption}>
        Danach richten sich deine E-Mail-Benachrichtigungen zu neuen Abstimmungen,
        Ministerialentwürfen und Anträgen.
      </Text>

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Themen suchen..."
        filled
      />

      {loading ? (
        <Text style={typography.caption}>Themen werden geladen</Text>
      ) : needle ? (
        <View style={styles.results}>
          {results.length === 0 ? (
            <Text style={typography.bodyMuted}>Keine Themen gefunden</Text>
          ) : (
            <>
              {results.slice(0, MAX_RESULTS).map((topic) => {
                const isSelected = selectedIds.has(topic.id);
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => toggleOne(topic)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
                    <View style={[styles.box, isSelected && styles.boxActive]}>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={13} color={colors.onAccent} />
                      ) : null}
                    </View>
                    <Text style={[typography.subtitle, styles.resultLabel]} numberOfLines={1}>
                      {topic.topic}
                    </Text>
                  </Pressable>
                );
              })}
              {results.length > MAX_RESULTS ? (
                <Text style={typography.caption}>
                  … und {results.length - MAX_RESULTS} weitere. Suche genauer.
                </Text>
              ) : null}
            </>
          )}
        </View>
      ) : (
        <View style={styles.groups}>
          {groups.map((group) => (
            <TopicAccordion
              key={group.title}
              title={group.title}
              topics={group.topics}
              selectedIds={selectedIds}
              onToggle={toggleOne}
              onToggleAll={toggleMany}
            />
          ))}
        </View>
      )}

      <SelectedTopicsSheet
        visible={showSelected}
        topics={selected}
        onRemove={toggleOne}
        onClose={() => setShowSelected(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  countLabel: {
    color: colors.accent,
  },
  groups: {
    gap: spacing.sm,
  },
  results: {
    gap: spacing.xs,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  resultLabel: {
    flex: 1,
    color: colors.textTitle,
  },
  box: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.cardRaised,
  },
  boxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
});
