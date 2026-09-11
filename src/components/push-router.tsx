/* opens the screen a tapped notification points at, rendered by the root layout so
   it catches both a tap while the app is running and a cold start from one */
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { type NotificationTarget, parseNotificationTarget, targetHref } from '@/lib/notification-target';
import { getCountry, setCountry } from '@/lib/somes';

export function PushRouter() {
  // covers the cold start too, the hook replays the response the app was opened with
  const response = Notifications.useLastNotificationResponse();
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const queryClient = useQueryClient();
  /** the hook keeps handing back the same response after it is dealt with, so
      without this every re-render would push the same screen again */
  const handled = useRef<string | null>(null);

  // this component is a sibling of the navigator and mounts before it, so a cold
  // start response can arrive while there is still nothing that can accept a push
  const ready = navigationState?.key !== undefined;

  useEffect(() => {
    if (!ready || !response) return;

    const { identifier } = response.notification.request;
    if (handled.current === identifier) return;
    // claimed before the await below, so a re-render mid switch cannot re-enter
    handled.current = identifier;

    const target = parseNotificationTarget(response.notification.request.content.data);
    if (!target) return;

    // deliberately not guarded by a cancelled flag on cleanup: the ref above already
    // caps this at one navigation per notification, and aborting a switch that is
    // already in flight would drop the tap entirely rather than defer it
    async function open(destination: NotificationTarget) {
      try {
        if (destination.country !== getCountry()) {
          // the client is rebuilt per region, cached rows belong to the old one
          await setCountry(destination.country);
          queryClient.clear();
        }
        router.push(targetHref(destination));
      } catch (error) {
        // a tap that cannot be resolved still leaves the app open and usable
        console.warn(`Could not open the notification target: ${error}`);
      }
    }

    open(target);
  }, [ready, response, router, queryClient]);

  return null;
}
