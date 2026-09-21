import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth, useExtendedUser, useSession } from '@/lib/use-auth';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** the address comes from the jwt, not from the user endpoint, an anonymised
    account only stores a hash there */
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
          <Button label="Anmelden" onPress={() => router.push('/anmelden')} style={styles.bigButton} />
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
            // the web slices part of the hash so two anonymised accounts can be told apart
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grow: {
    gap: spacing.xs,
  },
  bigButton: {
    height: 'auto'
  },
});
