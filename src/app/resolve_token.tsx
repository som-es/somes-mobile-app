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
      // dismissTo rather than replace(): this deep link can land on top of an
      // still-open /anmelden screen (the auth session there resolves separately
      // and calls dismissTo too), so anything less than dismissing back to
      // /profil can leave /anmelden underneath for a stray back() to return to
      if (!cancelled) router.dismissTo('/profil');
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
