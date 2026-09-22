import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { OpinionCard, OpinionLegend } from '@/components/delegate/opinion';
import { SectionCard } from '@/components/detail/section-card';
import { VoteMark } from '@/components/ui/vote-mark';
import { minutes } from '@/lib/date';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Speech } from '@/types';

const PREVIEW = 3;

type Props = {
  speeches: Speech[];
  /** entry_count from the endpoint, one page only carries the first 16 */
  total: number;
};

export function DelegateSpeechesCard({ speeches, total }: Props) {
  const { t } = useTranslation('delegates');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);

  if (speeches.length === 0) return null;

  const shown = expanded ? speeches : speeches.slice(0, PREVIEW);

  return (
    <SectionCard title={t('speeches.title')} action={<OpinionLegend />}>
      <Text style={[typography.caption, styles.total]}>
        {t('speeches.totalCount', { count: total })}
      </Text>

      <View style={styles.list}>
        {shown.map(({ id, speech }) => {
          // the first link is the one the old single document_url pointed at
          const documentUrl = speech.document_urls?.[0] ?? null;

          return (
            <OpinionCard
              key={id}
              infavor={speech.infavor}
              onPress={documentUrl ? () => Linking.openURL(documentUrl) : undefined}>
              <View style={styles.titleRow}>
                <Text style={[typography.rowTitle, styles.title]} numberOfLines={3}>
                  {speech.about ?? t('speeches.noTopic')}
                </Text>
                {speech.infavor !== null ? (
                  <VoteMark infavor={speech.infavor} size={18} />
                ) : null}
              </View>

              <View style={styles.metaRow}>
                <Text style={typography.caption}>
                  {[
                    speech.infavor === null ? speech.opinion : null,
                    speech.duration_in_seconds ? minutes(speech.duration_in_seconds, locale) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                {documentUrl ? (
                  <Ionicons name="book-outline" size={14} color={colors.textPlaceholder} />
                ) : null}
              </View>
            </OpinionCard>
          );
        })}
      </View>

      {speeches.length > PREVIEW ? (
        <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8} style={styles.more}>
          <Text style={[typography.subtitle, styles.moreLabel]}>
            {expanded
              ? t('speeches.showLess')
              : t('speeches.showMore', { count: speeches.length - PREVIEW })}
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
