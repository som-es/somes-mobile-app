/* ported from somes-core/somes-frontend/src/lib/api/authed.ts */
import type {
  DelegateFavo,
  ExtendedUserInfo,
  HasError,
  JWTInfo,
  LegisInitFavo,
  MailSendInfo,
  Quiz,
  UniqueTopic,
} from '@/types';
import { getToken } from '@/lib/auth-store';

import { fetchSavely, justPost, url } from './client';

const missingToken: HasError = {
  error: 'No access token',
  error_type: 'AuthError',
  field: 'MissingToken',
  meta: null,
};

function authedRequest<T>(
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  route: string,
  body: unknown | undefined,
  country: string
): Promise<T | HasError> {
  const accessToken = getToken();
  if (accessToken == null) {
    return Promise.resolve(missingToken);
  }
  return fetchSavely<T>(() =>
    fetch(`${url}${country}${route}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
}

export function getWithAuth<T>(route: string, country = 'at/') {
  return authedRequest<T>('GET', route, undefined, country);
}

export function putWithAuth<T>(route: string, body: unknown, country = 'at/') {
  return authedRequest<T>('PUT', route, body, country);
}

export function postWithAuth<T>(route: string, body: unknown, country = 'at/') {
  return authedRequest<T>('POST', route, body, country);
}

export function deleteWithAuth<T>(route: string, body?: unknown, country = 'at/') {
  return authedRequest<T>('DELETE', route, body, country);
}

// --- user ------------------------------------------------------------------
export function getUser() {
  return getWithAuth<ExtendedUserInfo>('v1/user');
}

const DELETE_ACCOUNT_ROUTE = 'v1/user/delete';

export function delete_account() {
  return deleteWithAuth<null>(DELETE_ACCOUNT_ROUTE);
}

export function renew_token() {
  return postWithAuth<JWTInfo>('v1/user/renew_token', {});
}

export function login(
  email: string,
  password: string | null,
  hash_email: boolean | null
): Promise<JWTInfo | HasError> {
  return justPost<JWTInfo>('v1/user/login', {
    email,
    password,
    hash_email,
  });
}

// --- notification preferences ----------
export function getMailSendInfo() {
  return getWithAuth<MailSendInfo>('v1/user/send_mail_info');
}

export function updateMailSendInfo(mailSendInfo: MailSendInfo) {
  return putWithAuth<null>('v1/user/send_mail_info', mailSendInfo);
}

// --- topic selection -------------------------------------------------------
export function getUserTopics() {
  return getWithAuth<UniqueTopic[]>('v1/user/topic_selection');
}

export function addUserTopic(uniqueTopic: UniqueTopic) {
  return postWithAuth<null>('v1/user/topic_selection', uniqueTopic);
}

export function removeUserTopic(uniqueTopic: UniqueTopic) {
  return deleteWithAuth<null>('v1/user/topic_selection', uniqueTopic);
}

// --- bookmarks -------------------------------------------------------------
export function getFavoDelegates() {
  return getWithAuth<DelegateFavo[]>('v1/user/bookmark/delegate');
}

export function addDelegateFavo(delegateFavo: DelegateFavo) {
  return postWithAuth<null>('v1/user/bookmark/delegate', delegateFavo);
}

export function updateDelegateFavo(delegateFavo: DelegateFavo) {
  return putWithAuth<null>('v1/user/bookmark/delegate', delegateFavo);
}

export function removeDelegateFavo(delegateFavo: DelegateFavo) {
  return deleteWithAuth<null>('v1/user/bookmark/delegate', delegateFavo);
}

export function getFavoLegisInits() {
  return getWithAuth<LegisInitFavo[]>('v1/user/bookmark/vote_result');
}

export function addLegisInitFavo(legisInitFavo: LegisInitFavo) {
  return postWithAuth<null>('v1/user/bookmark/vote_result', legisInitFavo);
}

export function removeLegisInitFavo(legisInitFavo: LegisInitFavo) {
  return deleteWithAuth<null>('v1/user/bookmark/vote_result', legisInitFavo);
}

export function getQuizzes() {
  return getWithAuth<Quiz[]>('quizzes');
}
