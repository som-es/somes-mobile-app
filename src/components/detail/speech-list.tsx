import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { url } from '@/api/client';
import { minutes } from '@/lib/date';
import { VoteMark } from '@/components/ui/vote-mark';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, Speech } from '@/types';

import { SectionCard } from './section-card';

const AVATAR = 40;
const PAGE = 3;

type Props = {
  speeches: Speech[];
  /** Every member sitting on the day of the vote, keyed by id. */
  delegates: Map<number, Delegate>;
};

/**
 * "Reden".
 *
 * Each row shows the agenda item and the length, and tapping it opens the
 * stenographic protocol.
 *
 * The paragraph the Figma draws here is now backable: every speech carries an
 * `ai_summary` with a short title, several summary lengths, key points and a
 * glossary. It is deliberately not rendered yet — that is a design change, not
 * an API migration, and this pass only keeps the screen working against the new
 * payload. See `Speech` in `@/types`.
 */
export function SpeechList({ speeches, delegates }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { data: partyColors } = usePartyColors();

  const shown = expanded ? speeches : speeches.slice(0, PAGE);

  return (
    <SectionCard title="Reden">
      <View style={styles.list}>
        {shown.map(({ id, speech }) => {
          const delegate = delegates.get(speech.delegate_id);
          const party = delegate?.party;
          // One speech can have several protocol links; the first is the one the
          // old single `document_url` pointed at.
          const documentUrl = speech.document_urls?.[0] ?? null;

          return (
            <Pressable
              key={id}
              onPress={documentUrl ? () => Linking.openURL(documentUrl) : undefined}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Image
                source={{ uri: `${url}assets/${speech.delegate_id}.jpg` }}
                style={styles.avatar}
                accessibilityLabel={delegate?.name}
              />

              <View style={styles.text}>
                <Text style={typography.rowTitle} numberOfLines={1}>
                  {delegate?.name ?? 'Unbekannt'}
                </Text>

                {party ? (
                  <View style={styles.meta}>
                    <View
                      style={[styles.dot, { backgroundColor: partyColors?.get(party) ?? '#ccc' }]}
                    />
                    <Text style={typography.caption}>{party}</Text>
                  </View>
                ) : null}

                {speech.about ? (
                  <Text style={typography.bodyMuted} numberOfLines={2}>
                    {speech.about}
                  </Text>
                ) : null}

                {speech.duration_in_seconds ? (
                  <Text style={typography.caption}>{minutes(speech.duration_in_seconds)}</Text>
                ) : null}
              </View>

              {speech.infavor !== null ? <VoteMark infavor={speech.infavor} size={18} /> : null}
            </Pressable>
          );
        })}
      </View>

      {speeches.length > PAGE ? (
        <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8} style={styles.more}>
          <Text style={[typography.subtitle, styles.moreLabel]}>
            {expanded ? 'Weniger anzeigen' : `Mehr anzeigen (${speeches.length - PAGE})`}
          </Text>
        </Pressable>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 999,
    backgroundColor: colors.cardRaised,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  more: {
    marginTop: spacing.lg,
  },
  moreLabel: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
