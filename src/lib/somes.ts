/* every request to somes.at goes through @som-es/somes-ts, this module holds the
   parts that cannot live in a shared library: which host to talk to, where the
   token is kept, and how an ApiError reads to this app */
import { ApiError, SomesClient, TokenStore, type Country, type TokenPersistence } from '@som-es/somes-ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { SignUpError } from '@/types';

/** override with EXPO_PUBLIC_API_URL to point a build at a local somes-api */
const address = process.env.EXPO_PUBLIC_API_URL ?? 'https://somes.at';

const JWT_KEY = 'somes.jwt';
const COUNTRY_KEY = 'somes.country';
const DEFAULT_COUNTRY: Country = 'at';

/** the library's token backend on top of expo-secure-store, a failing keychain
    degrades to signed out rather than taking the app down with it */
const secureStore: TokenPersistence = {
  async load() {
    try {
      return await SecureStore.getItemAsync(JWT_KEY);
    } catch (error) {
      console.warn(`Could not read the stored token: ${error}`);
      return null;
    }
  },
  async save(token) {
    try {
      await SecureStore.setItemAsync(JWT_KEY, token);
    } catch (error) {
      console.warn(`Could not persist the token: ${error}`);
    }
  },
  async clear() {
    try {
      await SecureStore.deleteItemAsync(JWT_KEY);
    } catch (error) {
      console.warn(`Could not clear the stored token: ${error}`);
    }
  },
};

/** the store caches synchronously, so the token can be read during a render */
export const tokenStore = new TokenStore(secureStore);

export let somes = new SomesClient({ baseUrl: address, country: 'at', tokenStore });

let country: Country = DEFAULT_COUNTRY;
const countryListeners = new Set<(country: Country) => void>();

function isCountry(value: string | null): value is Country {
  return value === 'at' || value === 'eu';
}

/** reads the persisted country, call once alongside loadToken */
export async function loadCountry(): Promise<Country> {
  try {
    const stored = await AsyncStorage.getItem(COUNTRY_KEY);
    if (isCountry(stored) && stored !== country) {
      country = stored;
      somes = new SomesClient({ baseUrl: address, country, tokenStore });
      countryListeners.forEach((listener) => listener(country));
    }
  } catch (error) {
    console.warn(`Could not read the stored region: ${error}`);
  }
  return country;
}

/** synchronous read, DEFAULT_COUNTRY until loadCountry resolves */
export function getCountry(): Country {
  return country;
}

/** country is baked into every resource at construction, so switching rebuilds
    the client rather than mutating a field, the token store carries over as-is */
export async function setCountry(next: Country): Promise<void> {
  if (next === country) return;
  country = next;
  somes = new SomesClient({ baseUrl: address, country, tokenStore });
  countryListeners.forEach((listener) => listener(country));
  try {
    await AsyncStorage.setItem(COUNTRY_KEY, next);
  } catch (error) {
    console.warn(`Could not persist the region: ${error}`);
  }
}

export function subscribeToCountry(listener: (country: Country) => void): () => void {
  countryListeners.add(listener);
  return () => countryListeners.delete(listener);
}

/** somes-api only mirrors AT portraits under /api/assets/{id}.jpg, EU MEPs get a
    404 there — their record instead carries a working image_url that points
    straight at europarl.europa.eu, so eu falls back to that */
export function delegateAvatarUrl(country: Country, id: number, imageUrl: string | null): string {
  return country === 'eu' && imageUrl ? imageUrl : somes.delegateImageUrl(id);
}

/** reads the persisted token into the cache, call once before the first request */
export function loadToken(): Promise<string | null> {
  return tokenStore.load();
}

/** synchronous read, null until loadToken resolves */
export function getToken(): string | null {
  return tokenStore.get();
}

export function setToken(token: string): Promise<void> {
  return tokenStore.set(token);
}

export function clearToken(): Promise<void> {
  return tokenStore.clear();
}

export function subscribeToToken(listener: (token: string | null) => void): () => void {
  return tokenStore.subscribe(listener);
}

/** missing or expired token, somes-api answers those with 400, not 401 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.errorType === 'AuthError';
}

export function isRateLimited(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

/** the flag struct somes-api puts in the error meta, login only sets the email ones */
export function signUpFlags(error: unknown): Partial<SignUpError> | null {
  return error instanceof ApiError && error.errorType === 'SignUpError' && error.meta
    ? (error.meta as Partial<SignUpError>)
    : null;
}
