/* ported from somes-core/somes-frontend/src/lib/api/api.ts. */
import type { HasError, SignUpError } from '@/types';

export const address = process.env.EXPO_PUBLIC_API_URL ?? 'https://somes.at';

export const url = `${address}/api/`;

export function toActualDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isHasError<T>(value: T | HasError): value is HasError {
  return (value as HasError)?.error !== undefined;
}

/** missing, or expired token */
export function isAuthError(value: HasError): boolean {
  return value.error_type === 'AuthError';
}

export function signUpFlags(value: HasError): Partial<SignUpError> | null {
  return value.error_type === 'SignUpError' && value.meta
    ? (value.meta as Partial<SignUpError>)
    : null;
}

export function errorToNull<T>(input: T | HasError): T | null {
  return isHasError(input) ? null : input;
}

export function unwrap<T>(input: T | HasError): T {
  if (isHasError(input)) {
    throw new Error(`${input.error_type}: ${input.error}`);
  }
  return input;
}

export async function fetchSavely<T>(fn: () => Promise<Response>): Promise<T | HasError> {
  let response;
  try {
    response = await fn();
    if (response.status === 429) {
      return {
        error: 'Too many requests',
        error_type: 'RateLimit',
        field: '',
        meta: null,
      };
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API error: ${error}, response: ${response?.url}`);
    return { error: 'Error data', error_type: 'FetchError', field: '', meta: null };
  }
}

export async function justPost<T>(route: string, body: unknown, country = 'at/') {
  return fetchSavely<T>(() =>
    fetch(`${url}${country}${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

export async function getWithRoute<T>(route: string, country = 'at/') {
  return fetchSavely<T>(() =>
    fetch(`${url}${country}${route}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  );
}
