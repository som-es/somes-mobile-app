import Ionicons from '@expo/vector-icons/Ionicons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/avatar';
import { StanceMark } from '@/components/ui/stance-mark';
import { minutes } from '@/lib/date';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, Speech } from '@/types';

export const SPEECH_AVATAR = 40;

type Props = {
  item: Speech;
  delegate: Delegate | undefined;
  expanded: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
};

/** shared between the vote screen's speech list and the MP profile's, so the two
    never drift apart. tapping the row expands it in place, following the same
    accordion pattern as profile/topic-accordion — "view details" inside the
    expanded state is what actually navigates to the full speech screen, and the
    document link (if any) only opens from there too, not on every row tap */
export function SpeechRow({ item, delegate, expanded, onToggle, onViewDetails }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const country = useCountry();
  const { data: partyColors } = usePartyColors();
  const { speech, ai_summary } = item;
  const party = delegate?.party;
  // the first link is the one the old single document_url pointed at
  const documentUrl = speech.document_urls?.[0] ?? null;
  // empty strings fall through, speeches not regenerated yet keep their old text
  const collapsedSummary =
    ai_summary?.one_sentence_short_summary || ai_summary?.short_summary || speech.about || null;
  const expandedSummary = ai_summary?.very_short_summary || collapsedSummary;
  const displayedSummary = expanded ? expandedSummary : collapsedSummary;
  const durationText = speech.duration_in_seconds
    ? minutes(speech.duration_in_seconds, locale)
    : null;
  // the api only sends a free-text opinion when there is no clear yes/no result
  const opinionText = speech.infavor === null ? speech.opinion : null;
  const metaText = [opinionText, durationText].filter(Boolean).join(' · ');

  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <Avatar
          uri={delegateAvatarUrl(country, speech.delegate_id, delegate?.image_url ?? null)}
          size={SPEECH_AVATAR}
          accessibilityLabel={delegate?.name}
          style={styles.avatar}
        />

        <View style={styles.text}>
          <Text style={typography.rowTitle} numberOfLines={1}>
            {delegate?.name ?? t('common:detail.unknownDelegate')}
          </Text>

          {party ? (
            <View style={styles.meta}>
              <View style={[styles.dot, { backgroundColor: partyColors?.get(party) ?? '#ccc' }]} />
              <Text style={typography.caption}>{party}</Text>
            </View>
          ) : null}

          {ai_summary?.short_title ? (
            <Text style={typography.rowTitle} numberOfLines={2}>
              {ai_summary.short_title}
            </Text>
          ) : null}

          {displayedSummary ? <Text style={typography.bodyMuted}>{displayedSummary}</Text> : null}

          {metaText ? <Text style={typography.caption}>{metaText}</Text> : null}
        </View>

        <View style={styles.trailing}>
          {speech.infavor !== null ? <StanceMark infavor={speech.infavor} size={18} /> : null}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.expanded}>
          <Pressable
            onPress={onViewDetails}
            accessibilityRole="button"
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <Text style={[typography.subtitle, styles.actionLabel]}>
              {t('common:detail.viewDetails')}
            </Text>
          </Pressable>

          {documentUrl ? (
            <Pressable
              onPress={() => Linking.openURL(documentUrl)}
              accessibilityRole="link"
              style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
              <Ionicons name="book-outline" size={16} color={colors.textMuted} />
              <Text style={typography.subtitle}>{t('common:detail.document')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  trailing: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  expanded: {
    marginTop: spacing.sm,
    marginLeft: SPEECH_AVATAR + spacing.md,
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
});
