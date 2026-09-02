import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { somes } from '@/lib/somes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';

const AVATAR = 48;

type Props = {
  id: number;
  name: string;
  party: string | null;
  role?: string | null;
};

export function DelegateRow({ id, name, party, role }: Props) {
  const router = useRouter();
  const partyColor = usePartyColor(party);

  return (
    <Card
      variant="outlined"
      elevation="row"
      onPress={() => router.push({ pathname: '/abgeordnete/[id]', params: { id } })}>
      <View style={styles.row}>
        <Image
          source={{ uri: somes.delegateImageUrl(id) }}
          style={styles.avatar}
          accessibilityLabel={name}
        />

        <View style={styles.text}>
          <Text style={typography.rowTitle} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.meta}>
            {party ? (
              <>
                <View style={[styles.dot, { backgroundColor: partyColor }]} />
                <Text style={typography.caption}>{party}</Text>
              </>
            ) : role ? (
              <Text style={typography.caption}>{role}</Text>
            ) : null}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textCaption} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 999,
    backgroundColor: colors.card,
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
});
