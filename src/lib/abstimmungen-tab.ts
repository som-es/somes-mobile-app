export type AbstimmungenTab = 'nationalrat' | 'regierung';

/* a tab navigator keeps every tab mounted once visited and doesn't remount it
   on refocus, so a route param set on navigation isn't a reliable way to tell
   an already-open Abstimmungen tab which segment to land on. Home's "Weitere
   ..." links set this instead, and the tab screen consumes it on every focus
   via useFocusEffect, which fires regardless of mount state. */
let pending: AbstimmungenTab | null = null;

export function requestAbstimmungenTab(tab: AbstimmungenTab) {
  pending = tab;
}

/** clears the request after reading it, so a later manual segment switch
    isn't overridden the next time this screen refocuses */
export function takeRequestedAbstimmungenTab(): AbstimmungenTab | null {
  const tab = pending;
  pending = null;
  return tab;
}
