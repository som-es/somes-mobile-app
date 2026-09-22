import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { minutes } from '@/lib/date';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VoteMark } from '@/components/ui/vote-mark';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, Speech } from '@/types';

import { SectionCard } from './section-card';

export const SPEECH_AVATAR = 40;
const PAGE = 3;

type Props = {
  speeches: Speech[];
  delegates: Map<number, Delegate>;
  gp: string;
  ityp: string;
  inr: string;
};

export function SpeechList({ speeches, delegates, gp, ityp, inr }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const shown = speeches.slice(0, PAGE);

  return (
    <SectionCard title={t('common:detail.speeches')}>
      <View style={styles.list}>
        {shown.map((item) => (
          <SpeechRow key={item.id} item={item} delegate={delegates.get(item.speech.delegate_id)} />
        ))}
      </View>

      {speeches.length > PAGE ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/abstimmung/[gp]/[ityp]/[inr]/reden', params: { gp, ityp, inr } })
          }
          hitSlop={8}
          style={styles.more}>
          <Text style={[typography.subtitle, styles.moreLabel]}>
            {t('common:detail.showAllSpeeches', { count: speeches.length })}
          </Text>
        </Pressable>
      ) : null}
    </SectionCard>
  );
}

/** the row itself, shared between the inline preview here and the full list at
    abstimmung/[gp]/[ityp]/[inr]/reden so the two never drift apart */
export function SpeechRow({ item, delegate }: { item: Speech; delegate: Delegate | undefined }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const country = useCountry();
  const { data: partyColors } = usePartyColors();
  const { speech, ai_summary } = item;
  const party = delegate?.party;
  // the first link is the one the old single document_url pointed at
  const documentUrl = speech.document_urls?.[0] ?? null;
  const summaryText = ai_summary?.short_summary ?? speech.about ?? null;

  return (
    <Pressable
      onPress={documentUrl ? () => Linking.openURL(documentUrl) : undefined}
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

        {summaryText ? (
          <Text style={typography.bodyMuted} numberOfLines={2}>
            {summaryText}
          </Text>
        ) : null}

        {ai_summary?.short_summary ? <Badge label={t('common:detail.aiSummaryBadge')} /> : null}

        {speech.duration_in_seconds ? (
          <Text style={typography.caption}>{minutes(speech.duration_in_seconds, locale)}</Text>
        ) : null}
      </View>

      {speech.infavor !== null ? <VoteMark infavor={speech.infavor} size={18} /> : null}
    </Pressable>
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
