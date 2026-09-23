import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { partyLabel } from '@/components/cards/delegate-card';
import { Avatar } from '@/components/ui/avatar';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useDelegate } from '@/lib/use-delegate';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  delegateId: number;
  size: number;
};

/** the AT portrait url only needs the id, so the avatar starts loading before
    the MP record arrives; the name line stays hidden until then (or on error)
    instead of a skeleton, so the card barely shifts */
export function QuestionRecipient({ delegateId, size }: Props) {
  const { t } = useTranslation('questions');
  const country = useCountry();
  const { data: delegate } = useDelegate(delegateId);

  return (
    <View style={styles.row}>
      <Avatar
        uri={delegateAvatarUrl(country, delegateId, delegate?.image_url ?? null)}
        size={size}
        accessibilityLabel={delegate?.name}
      />
      <View style={styles.text}>
        <Text style={typography.caption}>{t('detail.askedLabel')}</Text>
        {delegate ? (
          <Text style={typography.cardTitle} numberOfLines={1}>
            {delegate.name} · {partyLabel(t, delegate.party)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    flex: 1,
  },
});
