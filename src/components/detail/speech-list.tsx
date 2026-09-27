import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Delegate, Speech } from '@/types';

import { SectionCard } from './section-card';
import { SpeechRow } from './speech-row';

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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const shown = speeches.slice(0, PAGE);
  const hasAiSummary = speeches.some((item) => item.ai_summary != null);

  return (
    <SectionCard
      title={t('common:detail.speeches')}
      action={hasAiSummary ? <Badge label={t('common:detail.aiSummaryBadge')} /> : undefined}>
      <View style={styles.list}>
        {shown.map((item) => (
          <SpeechRow
            key={item.id}
            item={item}
            delegate={delegates.get(item.speech.delegate_id)}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onViewDetails={() =>
              router.push({
                pathname: '/rede/[id]',
                params: { id: String(item.id), gp, ityp, inr },
              })
            }
          />
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

const styles = StyleSheet.create({
  list: {
    gap: spacing.lg,
  },
  more: {
    marginTop: spacing.lg,
  },
  moreLabel: {
    fontWeight: '600',
  },
});
