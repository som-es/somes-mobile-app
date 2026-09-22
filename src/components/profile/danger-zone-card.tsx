import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { somes } from '@/lib/somes';
import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export function DangerZoneCard() {
  const { t } = useTranslation('profile');
  const { signOut } = useSession();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await somes.account.deleteAccount();
    } catch {
      // somes-frontend clears the jwt regardless, so a failed delete looks like it worked
      Alert.alert(t('dangerZone.deleteFailedTitle'), t('dangerZone.deleteFailedMessage'));
      return;
    } finally {
      setPending(false);
    }
    await signOut();
  }

  function confirm() {
    Alert.alert(t('dangerZone.confirmTitle'), t('dangerZone.confirmMessage'), [
      { text: t('common:actions.cancel'), style: 'cancel' },
      { text: t('dangerZone.confirmDelete'), style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <Card style={styles.card}>
      <Text style={[typography.cardHeading, styles.title]}>{t('dangerZone.heading')}</Text>
      <Text style={[typography.caption, styles.subtitle]}>{t('dangerZone.subtitle')}</Text>
      <Button
        label={t('dangerZone.deleteButton')}
        onPress={confirm}
        variant="danger"
        loading={pending}
        style={styles.bigButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.md,
  },
  title: {
    color: colors.danger,
  },
  subtitle: {
    color: colors.dangerSubtle,
  },
  bigButton: {
    height: 'auto'
  },
});
