/* jwt in expo-secure-store, the module level cache exists so the api layer can read
   the token synchronously, keep this file free of react imports */
import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'somes.jwt';

let cachedToken: string | null = null;
let loaded = false;

const listeners = new Set<(token: string | null) => void>();

function emit() {
  listeners.forEach((listener) => listener(cachedToken));
}

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

/** synchronous read for the api layer, null until loadtoken resolves */
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
