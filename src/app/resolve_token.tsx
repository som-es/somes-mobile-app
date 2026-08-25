import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';

/**
 * Deep-link fallback for `somesmobileapp://resolve_token?token=…`, the mobile
 * counterpart of somes-frontend's `/resolve_token` page.
 *
 * In the normal flow this never renders: `openAuthSessionAsync` intercepts the
 * redirect and hands the URL straight back to the login screen. It matters when
 * that session is not there to catch it — the user backgrounded the app
 * mid-login, or the OS delivered the link cold. Without this route expo-router
 * would land on an unmatched path holding a perfectly good token.
 */
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
