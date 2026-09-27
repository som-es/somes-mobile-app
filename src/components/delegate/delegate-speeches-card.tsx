import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SectionCard } from '@/components/detail/section-card';
import { SpeechRow } from '@/components/detail/speech-row';
import { Badge } from '@/components/ui/badge';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate, Speech } from '@/types';

const PREVIEW = 3;

type Props = {
  speeches: Speech[];
  /** entry_count from the endpoint, one page only carries the first 16 */
  total: number;
  /** every speech in this list is by the profile's own MP, so one delegate
      renders every row's avatar/name/party */
  delegate: Delegate;
};

export function DelegateSpeechesCard({ speeches, total, delegate }: Props) {
  const { t } = useTranslation('delegates');
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (speeches.length === 0) return null;

  const shown = speeches.slice(0, PREVIEW);
  const hasAiSummary = speeches.some((item) => item.ai_summary != null);

  return (
    <SectionCard
      title={t('speeches.title')}
      action={hasAiSummary ? <Badge label={t('common:detail.aiSummaryBadge')} /> : undefined}>
      <Text style={[typography.caption, styles.total]}>
        {t('speeches.totalCount', { count: total })}
      </Text>

      <View style={styles.list}>
        {shown.map((item) => (
          <SpeechRow
            key={item.id}
            item={item}
            delegate={delegate}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onViewDetails={() =>
              router.push({
                pathname: '/rede/[id]',
                params: { id: String(item.id), delegateId: String(delegate.id) },
              })
            }
          />
        ))}
      </View>

      {total > PREVIEW ? (
        <Pressable
          onPress={() =>
            router.push({ pathname: '/abgeordnete/[id]/reden', params: { id: String(delegate.id) } })
          }
          hitSlop={8}
          style={styles.more}>
          <Text style={[typography.subtitle, styles.moreLabel]}>
            {t('speeches.showMore', { count: total - shown.length })}
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
    gap: spacing.lg,
  },
  more: {
    marginTop: spacing.md,
  },
  moreLabel: {
    fontWeight: '600',
  },
});
