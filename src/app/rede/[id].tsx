import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Divider, SectionCard } from '@/components/detail/section-card';
import { DetailScreen, parliamentUrl } from '@/components/detail/detail-screen';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { StanceMark } from '@/components/ui/stance-mark';
import { minutes } from '@/lib/date';
import { delegateAvatarUrl, somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, Speech, SpeechesWithMaxPage, VoteResult } from '@/types';

/** the backend is still working on the critical analysis, flip once it's ready */
const SHOW_CRITICAL_ANALYSIS = false;

type SpeechParams = {
  id: string;
  gp?: string;
  ityp?: string;
  inr?: string;
  delegateId?: string;
};

/** there is no speeches.byId() endpoint, so the speech itself has to come out of
    whichever parent list already fetched it: the vote-result cache when the row
    was reached from a vote, or the MP's own speeches cache (first page or the
    paginated full-list cache) when it was reached from a profile */
function resolveSpeech(queryClient: QueryClient, params: SpeechParams): Speech | null {
  const { id, gp, ityp, inr, delegateId } = params;

  if (gp && ityp && inr) {
    const vote = queryClient.getQueryData<VoteResult>(['vote-result', gp, ityp, inr]);
    const found = vote?.speeches.find((item) => String(item.id) === id);
    if (found) return found;
  }

  if (delegateId) {
    const firstPage = queryClient.getQueryData<SpeechesWithMaxPage>([
      'delegate-speeches',
      delegateId,
    ]);
    const foundFirst = firstPage?.speeches.find((item) => String(item.id) === id);
    if (foundFirst) return foundFirst;

    const allPages = queryClient.getQueryData<{ pages: SpeechesWithMaxPage[] }>([
      'delegate-speeches-all',
      delegateId,
    ]);
    const foundAll = allPages?.pages
      .flatMap((page) => page.speeches)
      .find((item) => String(item.id) === id);
    if (foundAll) return foundAll;
  }

  return null;
}

export default function SpeechDetailScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const country = useCountry();
  const params = useLocalSearchParams<SpeechParams>();
  const { id, gp, ityp, inr, delegateId } = params;

  const speech = resolveSpeech(queryClient, { id, gp, ityp, inr, delegateId });

  const delegateFetchId = delegateId ?? (speech ? String(speech.speech.delegate_id) : undefined);
  const delegate = useQuery({
    queryKey: ['delegate', delegateFetchId],
    queryFn: () => somes.delegates.byId(Number(delegateFetchId)),
    enabled: delegateFetchId !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return (
    <DetailScreen
      sourceUrl={gp && ityp && inr ? parliamentUrl(country, gp, ityp, inr) : undefined}>
      {speech ? (
        <SpeechDetail speech={speech} delegate={delegate.data} />
      ) : (
        <Notice message={t('common:detail.speechNotAvailable')} />
      )}
    </DetailScreen>
  );
}

function SpeechDetail({ speech: item, delegate }: { speech: Speech; delegate: Delegate | undefined }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const country = useCountry();
  const partyColor = usePartyColor(delegate?.party);
  const { speech, ai_summary } = item;
  const full = ai_summary?.full_speech_summary;
  const documentUrls = speech.document_urls ?? [];

  return (
    <>
      <Card>
        <View style={styles.headRow}>
          <Avatar
            uri={delegateAvatarUrl(country, speech.delegate_id, delegate?.image_url ?? null)}
            size={48}
            accessibilityLabel={delegate?.name}
          />
          <View style={styles.headText}>
            <Text style={typography.detailTitle} numberOfLines={2}>
              {delegate?.name ?? t('common:detail.unknownDelegate')}
            </Text>
            {delegate?.party ? (
              <View style={styles.meta}>
                <View style={[styles.dot, { backgroundColor: partyColor }]} />
                <Text style={typography.caption}>{delegate.party}</Text>
              </View>
            ) : null}
          </View>
          {speech.infavor !== null ? <StanceMark infavor={speech.infavor} size={22} /> : null}
        </View>

        {speech.infavor === null && speech.opinion ? (
          <Text style={[typography.bodyMuted, styles.spaced]}>{speech.opinion}</Text>
        ) : null}

        {speech.duration_in_seconds ? (
          <Text style={[typography.caption, styles.spaced]}>
            {minutes(speech.duration_in_seconds, locale)}
          </Text>
        ) : null}
      </Card>

      {ai_summary ? (
        <SectionCard
          title={t('common:detail.summaryHeading')}
          action={<Badge label={t('common:detail.aiSummaryBadge')} />}>
          <Text style={typography.bodyMuted}>{ai_summary.summary || ai_summary.short_summary}</Text>

          {ai_summary.detailed_summary ? (
            <>
              <Divider />
              <Text style={typography.cardHeading}>{t('common:detail.detailedSummary')}</Text>
              <Text style={[typography.bodyMuted, styles.spaced]}>{ai_summary.detailed_summary}</Text>
            </>
          ) : null}
        </SectionCard>
      ) : (
        <Notice message={t('common:detail.noAiSummary')} />
      )}

      {full && full.key_points.length > 0 ? (
        <SectionCard
          title={t('common:detail.keyPoints')}
          action={<Badge label={t('common:detail.aiSummaryBadge')} />}>
          <BulletList items={full.key_points.map((point) => point.summarized_point)} />
        </SectionCard>
      ) : null}

      {SHOW_CRITICAL_ANALYSIS && full ? (
        <SectionCard title={t('common:detail.criticalAnalysis')}>
          <Text style={typography.caption}>
            {t('common:detail.tone')}: {full.critical_analysis.tone}
          </Text>

          {full.critical_analysis.arguments_for.length > 0 ? (
            <>
              <Text style={[typography.cardHeading, styles.spaced]}>
                {t('common:detail.argumentsFor')}
              </Text>
              <BulletList items={full.critical_analysis.arguments_for} />
            </>
          ) : null}

          {full.critical_analysis.arguments_against.length > 0 ? (
            <>
              <Text style={[typography.cardHeading, styles.spaced]}>
                {t('common:detail.argumentsAgainst')}
              </Text>
              <BulletList items={full.critical_analysis.arguments_against} />
            </>
          ) : null}
        </SectionCard>
      ) : null}

      {documentUrls.length > 0 ? (
        <SectionCard title={t('common:detail.documents')}>
          <View style={styles.list}>
            {documentUrls.map((url, index) => (
              <Pressable
                key={url}
                onPress={() => Linking.openURL(url)}
                accessibilityRole="link"
                style={({ pressed }) => [styles.docRow, pressed && styles.pressed]}>
                <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
                <Text style={[typography.bodyMuted, styles.docLabel]} numberOfLines={1}>
                  {documentUrls.length > 1
                    ? `${t('common:detail.document')} ${index + 1}`
                    : t('common:detail.document')}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>
      ) : null}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text style={typography.bodyMuted}>{'•'}</Text>
          <Text style={[typography.bodyMuted, styles.bulletText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headText: {
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
  spaced: {
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  docLabel: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
});
