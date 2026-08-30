import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';

/* deep link fallback for somesmobileapp://resolve_token, used when the auth session
   is not around to catch the redirect itself */
export default function ResolveTokenScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { signIn } = useSession();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (token) await signIn(token);
      if (!cancelled) router.replace('/profil');
    })();

    return () => {
      cancelled = true;
    };
  }, [token, signIn, router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.chrome} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.screen,
  },
});
