/**
 * JWT storage — the React Native counterpart of the web app's
 * `jwtStore` (somes-frontend/src/lib/persisted.svelte.ts, localStorage-backed).
 *
 * On mobile the token goes into the Keychain / Android Keystore via
 * expo-secure-store rather than AsyncStorage.
 *
 * A module-level cache is kept alongside it so the API layer can read the token
 * synchronously, the way `jwtStore.value` does on web. Call `loadToken()` once
 * at app start before any authenticated request.
 */
import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'somes.jwt';

let cachedToken: string | null = null;
let loaded = false;

const listeners = new Set<(token: string | null) => void>();

function emit() {
  listeners.forEach((listener) => listener(cachedToken));
}

/** Hydrate the cache from secure storage. Safe to call more than once. */
export async function loadToken(): Promise<string | null> {
  if (!loaded) {
    try {
      cachedToken = await SecureStore.getItemAsync(JWT_KEY);
    } catch (error) {
      console.warn(`Could not read the stored token: ${error}`);
      cachedToken = null;
    }
    loaded = true;
    emit();
  }
  return cachedToken;
}

/** Synchronous read for the API layer. Returns null until `loadToken` resolves. */
export function getToken(): string | null {
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  loaded = true;
  try {
    if (token === null) {
      await SecureStore.deleteItemAsync(JWT_KEY);
    } else {
      await SecureStore.setItemAsync(JWT_KEY, token);
    }
  } catch (error) {
    console.warn(`Could not persist the token: ${error}`);
  }
  emit();
}

export function clearToken(): Promise<void> {
  return setToken(null);
}

export function subscribeToToken(listener: (token: string | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
