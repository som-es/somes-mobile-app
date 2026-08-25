import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { delete_account } from '@/api/authed';
import { isHasError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** "Gefahrenbereich" — Figma node 286:711. */
export function DangerZoneCard() {
  const { signOut } = useSession();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    const result = await delete_account();
    setPending(false);

    // somes-frontend discards this result and clears the JWT regardless, so a
    // failed delete still looks like it worked. Only sign out on success.
    if (isHasError(result)) {
      Alert.alert(
        'Account konnte nicht gelöscht werden',
        'Bitte versuche es später erneut. Dein Account ist unverändert.'
      );
      return;
    }
    await signOut();
  }

  function confirm() {
    Alert.alert(
      'Account löschen?',
      'Deine Interessen, Favoriten und Benachrichtigungen werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: remove },
      ]
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={[typography.cardHeading, styles.title]}>Gefahrenbereich</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        Diese Aktion kann nicht rückgängig gemacht werden
      </Text>
      <Button label="Account löschen" onPress={confirm} variant="danger" loading={pending} />
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
});
