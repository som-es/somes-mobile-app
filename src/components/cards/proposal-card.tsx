import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { isoToDotDate } from '@/lib/date';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { GovProposalDelegate } from '@/types';

const AVATAR = 48;

type Props = {
  proposal: GovProposalDelegate;
};

export function ProposalCard({ proposal }: Props) {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const country = useCountry();
  const { ministrial_proposal: draft, ai_summary } = proposal.gov_proposal;
  const delegate = proposal.delegates?.at(0);

  const title = ai_summary?.short_title ?? draft.title.split('|')[0].trim();
  const summary = ai_summary?.short_summary ?? draft.description;

  return (
    <Card
      onPress={() =>
        router.push({
          pathname: '/ministerialentwurf/[gp]/[inr]',
          params: { gp: draft.gp, inr: draft.inr },
        })
      }>
      <View style={styles.titleRow}>
        {delegate ? (
          <Avatar
            uri={delegateAvatarUrl(country, delegate.id, delegate.image_url)}
            size={AVATAR}
            accessibilityLabel={delegate.name}
          />
        ) : null}
        <Text style={[typography.cardTitle, styles.title]} numberOfLines={3}>
          {title}
        </Text>
      </View>

      {summary ? (
        <Text style={[typography.body, styles.summary]} numberOfLines={2}>
          {summary}
        </Text>
      ) : null}

      <View style={styles.badges}>
        {ai_summary?.short_summary ? <Badge label={t('detail.aiSummaryBadge')} /> : null}
        {draft.ressort ? <Badge label={draft.ressort_shortform ?? draft.ressort} /> : null}
        <Badge label={isoToDotDate(draft.raw_data_created_at, locale)} />
        <Badge label={draft.gp} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    flex: 1,
  },
  summary: {
    marginTop: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
