import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { minutes } from '@/lib/date';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  delegates: Map<number, Delegate>;
};

export function SpeechList({ speeches, delegates }: Props) {
  const country = useCountry();
  const [expanded, setExpanded] = useState(false);
  const { data: partyColors } = usePartyColors();

  const shown = expanded ? speeches : speeches.slice(0, PAGE);

  return (
    <SectionCard title="Reden">
      <View style={styles.list}>
        {shown.map(({ id, speech, ai_summary }) => {
          const delegate = delegates.get(speech.delegate_id);
          const party = delegate?.party;
          // the first link is the one the old single document_url pointed at
          const documentUrl = speech.document_urls?.[0] ?? null;
          const summaryText = ai_summary?.short_summary ?? speech.about ?? null;

          return (
            <Pressable
              key={id}
              onPress={documentUrl ? () => Linking.openURL(documentUrl) : undefined}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Avatar
                uri={delegateAvatarUrl(country, speech.delegate_id, delegate?.image_url ?? null)}
                size={AVATAR}
                accessibilityLabel={delegate?.name}
                style={styles.avatar}
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

                {ai_summary?.short_title ? (
                  <Text style={typography.rowTitle} numberOfLines={2}>
                    {ai_summary.short_title}
                  </Text>
                ) : null}

                {summaryText ? (
                  <Text style={typography.bodyMuted} numberOfLines={2}>
                    {summaryText}
                  </Text>
                ) : null}

                {ai_summary?.short_summary ? <Badge label="KI-Zusammenfassung" /> : null}

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
