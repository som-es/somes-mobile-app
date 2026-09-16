/* the contract with somes-api for what a push notification points at. kept free of
   expo-notifications so the mapping is testable without touching the native module */
import type { Href } from 'expo-router';

import type { Country } from '@/types';

/** inr and id arrive as numbers on the wire but every route param is a string */
export type NotificationTarget =
  | { type: 'vote'; country: Country; gp: string; ityp: string; inr: string }
  | { type: 'ministerial_proposal'; country: Country; gp: string; inr: string }
  | { type: 'decree'; country: Country; risId: string }
  | { type: 'delegate'; country: Country; id: string };

/** an id is useful as a string either way, and an empty one is as good as missing */
function text(value: unknown): string | null {
  if (typeof value === 'string') return value.length > 0 ? value : null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

/** null for anything this build does not understand, so a payload from a newer
    backend opens the app rather than throwing on the way to a screen */
export function parseNotificationTarget(data: unknown): NotificationTarget | null {
  if (typeof data !== 'object' || data === null) return null;

  const payload = data as Record<string, unknown>;
  const country = payload.country;
  // gp is region specific, XXVIII in at and 10 in eu, so a target without a region
  // cannot be resolved against the right api even though it looks complete
  if (country !== 'at' && country !== 'eu') return null;

  switch (payload.type) {
    case 'vote': {
      const gp = text(payload.gp);
      const ityp = text(payload.ityp);
      const inr = text(payload.inr);
      return gp && ityp && inr ? { type: 'vote', country, gp, ityp, inr } : null;
    }
    case 'ministerial_proposal': {
      const gp = text(payload.gp);
      const inr = text(payload.inr);
      return gp && inr ? { type: 'ministerial_proposal', country, gp, inr } : null;
    }
    case 'decree': {
      const risId = text(payload.ris_id);
      return risId ? { type: 'decree', country, risId } : null;
    }
    case 'delegate': {
      const id = text(payload.id);
      return id ? { type: 'delegate', country, id } : null;
    }
    default:
      return null;
  }
}

export function targetHref(target: NotificationTarget): Href {
  switch (target.type) {
    case 'vote':
      return {
        pathname: '/abstimmung/[gp]/[ityp]/[inr]',
        params: { gp: target.gp, ityp: target.ityp, inr: target.inr },
      };
    case 'ministerial_proposal':
      // the route drops ityp, every ministerial draft is an ME
      return { pathname: '/ministerialentwurf/[gp]/[inr]', params: { gp: target.gp, inr: target.inr } };
    case 'decree':
      // a ris id carries characters that are unsafe in a path, router params are
      // escaped on the way into the url and decoded back out, so pass it raw
      return { pathname: '/verordnung/[risId]', params: { risId: target.risId } };
    case 'delegate':
      return { pathname: '/abgeordnete/[id]', params: { id: target.id } };
  }
}
