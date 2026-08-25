/**
 * Core fetch helpers, ported from somes-core/somes-frontend/src/lib/api/api.ts.
 *
 * The contract is deliberately identical to the web app's: nothing throws,
 * every call resolves to `T | HasError`, and callers narrow with `isHasError`.
 */
import type { HasError, SignUpError } from '@/types';

export const address = process.env.EXPO_PUBLIC_API_URL ?? 'https://somes.at';

export const url = `${address}/api/`;

export function toActualDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isHasError<T>(value: T | HasError): value is HasError {
  return (value as HasError)?.error !== undefined;
}

/** A missing, malformed or expired token. somes-api answers 400, never 401. */
export function isAuthError(value: HasError): boolean {
  return value.error_type === 'AuthError';
}

/**
 * The per-field flags behind a failed `login()`.
 *
 * somes-frontend has an `isLoginResponseError` that tests for `missing_email` on
 * the *top level* of the response. That can never match: `UserError::SignUpError`
 * serialises the flag struct into `meta` and puts `"SignUpError"` in
 * `error_type` (somes-api/src/routes/user/error.rs). So on somes.at the
 * "Fehlerhafte E-Mail-Adresse" branch is dead and every bad address falls through
 * to the generic server-error message. Reading `meta` is what actually works.
 */
export function signUpFlags(value: HasError): Partial<SignUpError> | null {
  return value.error_type === 'SignUpError' && value.meta
    ? (value.meta as Partial<SignUpError>)
    : null;
}

export function errorToNull<T>(input: T | HasError): T | null {
  return isHasError(input) ? null : input;
}

/**
 * Throwing version for use inside react-query, which needs a rejected promise
 * to drive its error state. Prefer this in `queryFn`; use the raw callers when
 * you want to branch on the error yourself.
 */
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
