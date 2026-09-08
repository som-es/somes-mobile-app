/* keeps the backend's copy of this device's expo token current, rendered by the root
   layout so it sees both a fresh sign in and a cold start with a stored token */
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { getExpoPushToken, pushPlatform } from '@/lib/push';
import { somes } from '@/lib/somes';
import { useAuth } from '@/lib/use-auth';
import { PUSH_DEVICE_KEY, PUSH_TOKENS_KEY } from '@/lib/use-push';

export function PushRegistrar() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    /** silent: request is false, so someone who never enabled push is never prompted,
        and the upsert only ever refreshes a device that already opted in */
    async function register() {
      try {
        const result = await getExpoPushToken({ request: false });
        if (cancelled || result.status !== 'ok') return;
        await somes.account.registerPushToken(result.token, pushPlatform());
        if (cancelled) return;
        queryClient.invalidateQueries({ queryKey: PUSH_TOKENS_KEY });
      } catch (error) {
        // a device that fails to register still has a working app, just no push
        console.warn(`Could not register the push token: ${error}`);
      }
    }

    register();

    // the underlying fcm/apns token can be rotated by the os, which invalidates the
    // expo token built on top of it, so re-read and re-register when that happens
    const subscription = Notifications.addPushTokenListener(() => {
      queryClient.invalidateQueries({ queryKey: PUSH_DEVICE_KEY });
      register();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [isAuthenticated, queryClient]);

  return null;
}
