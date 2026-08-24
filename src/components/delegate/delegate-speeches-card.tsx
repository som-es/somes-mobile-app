import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { OpinionCard, OpinionLegend } from '@/components/delegate/opinion';
import { SectionCard } from '@/components/detail/section-card';
import { VoteMark } from '@/components/ui/vote-mark';
import { minutes } from '@/lib/date';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Speech } from '@/types';

const PREVIEW = 3;

type Props = {
  speeches: Speech[];
  /** `entry_count` from the endpoint — one page carries only the first 16. */
  total: number;
};

/**
 * "Letzte Reden".
 *
 * `SpeechList` in `components/detail/` is the mirror image of this — many
 * members, one vote — so it leads with a portrait and a name. Here the member is
 * fixed and the agenda item is what varies.
 *
 * `Speech` carries no prose and no date: only `about` (the agenda item),
 * `opinion` — the literal string "Pro" or "Contra" — a duration and a link to
 * the stenographic protocol. The paragraph and date the design draws under each
 * speech have no field behind them and are deliberately not invented; the card
 * shows the agenda item, the length, and a link to the protocol instead.
 */
export function DelegateSpeechesCard({ speeches, total }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (speeches.length === 0) return null;

  const shown = expanded ? speeches : speeches.slice(0, PREVIEW);

  return (
    <SectionCard title="Letzte Reden" action={<OpinionLegend />}>
      <Text style={[typography.caption, styles.total]}>
        {total} {total === 1 ? 'Rede' : 'Reden'} insgesamt
      </Text>

      <View style={styles.list}>
        {shown.map((speech, index) => (
          <OpinionCard
            // Speeches carry no id of their own — `Speech.legis_init_id` is
            // declared by somes-frontend but absent from this endpoint's
            // response, which returns `vote_result_ids`. Position it is.
            key={index}
            infavor={speech.infavor}
            onPress={
              speech.document_url ? () => Linking.openURL(speech.document_url!) : undefined
            }>
            <View style={styles.titleRow}>
              <Text style={[typography.rowTitle, styles.title]} numberOfLines={3}>
                {speech.about ?? 'Ohne Tagesordnungspunkt'}
              </Text>
              {speech.infavor !== null ? <VoteMark infavor={speech.infavor} size={18} /> : null}
            </View>

            <View style={styles.metaRow}>
              <Text style={typography.caption}>
                {speech.duration_in_seconds ? minutes(speech.duration_in_seconds) : ''}
              </Text>
              {speech.document_url ? (
                <Ionicons name="book-outline" size={14} color={colors.textPlaceholder} />
              ) : null}
            </View>
          </OpinionCard>
        ))}
      </View>

      {speeches.length > PREVIEW ? (
        <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8} style={styles.more}>
          <Text style={[typography.subtitle, styles.moreLabel]}>
            {expanded ? 'Weniger anzeigen' : `Mehr anzeigen (${speeches.length - PREVIEW})`}
          </Text>
        </Pressable>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  total: {
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  more: {
    marginTop: spacing.md,
  },
  moreLabel: {
    fontWeight: '600',
  },
});
