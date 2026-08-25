import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth, useExtendedUser, useSession } from '@/lib/use-auth';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/**
 * "Benutzerinfos" — Figma node 286:694.
 *
 * The address comes from the JWT's `sub` claim rather than `GET v1/user`, which
 * is what somes-frontend does: for an anonymised account the stored column holds
 * an argon2 hash, so the token is the only place the readable address survives.
 */
export function AccountCard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { signOut } = useSession();
  const { data: account } = useExtendedUser();

  if (!isAuthenticated) {
    return (
      <Card variant="outlined">
        <View style={styles.row}>
          <View style={styles.grow}>
            <Text style={typography.cardHeading}>Benutzerinfos</Text>
            <Text style={typography.caption}>Nicht angemeldet</Text>
          </View>
          <Button label="Anmelden" onPress={() => router.push('/anmelden')} />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <View style={styles.row}>
        <View style={styles.grow}>
          <Text style={typography.cardHeading}>Benutzerinfos</Text>
          {account?.is_email_hashed ? (
            // The web slices [36,60) out of the hash so a user can tell two
            // anonymised accounts apart without revealing either address.
            <Text style={typography.caption} numberOfLines={1}>
              anonymisiert ...{user?.sub.slice(36, 60)}...
            </Text>
          ) : (
            <Text style={typography.caption} numberOfLines={1}>
              {user?.sub}
            </Text>
          )}
        </View>
        <Button label="Abmelden" onPress={signOut} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  grow: {
    flex: 1,
    gap: spacing.xs,
  },
});
