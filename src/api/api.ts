/**
 * Public (unauthenticated) somes-api endpoints.
 * Ported from somes-core/somes-frontend/src/lib/api/api.ts.
 *
 * The SvelteKit `fetcher` parameter is dropped throughout — it exists there for
 * SSR, which React Native has no equivalent of.
 */
import type {
  DelegateQA,
  DelegatesWithMaxPage,
  Delegate,
  GeneralDelegateInfo,
  GeneralGovOfficialInfo,
  GovProposal,
  GovProposalDelegate,
  GovPropFilter,
  GovProposalsWithMaxPage,
  HasError,
  InterestShare,
  LegisPeriod,
  Party,
  PartyStates,
  SpeechesWithMaxPage,
  UniqueTopic,
  VoteResult,
  VoteResultFilter,
  VoteResultsWithMaxPage,
  WaloQuestion,
} from '@/types';
import type { Decree } from '@/types/decree';

import { getWithRoute, justPost } from './client';

export async function seats(): Promise<Map<string, number[]> | HasError> {
  const response = await getWithRoute<Record<string, number[]>>('seats');

  if (response && 'error' in response) {
    return response as HasError;
  }
  if (response) {
    return new Map(Object.entries(response));
  }
  return { error: 'Error fetching data', error_type: 'FetchError', field: '', meta: null };
}

export async function parties() {
  return getWithRoute<Party[]>('parties');
}

export async function parties_per_gp() {
  return getWithRoute<Record<string, Party[]>>('parties_per_gp');
}

export async function coalition_parties_per_gp() {
  return getWithRoute<Record<string, PartyStates>>('coalition_parties_per_gp');
}

export async function all_gps() {
  return getWithRoute<LegisPeriod[]>('all_gps');
}

export async function departments_per_gp() {
  return getWithRoute<Record<string, string[]>>('departments_per_gp');
}

export async function get_topics() {
  return getWithRoute<UniqueTopic[]>('topics');
}

export async function get_eurovoc_topics() {
  return getWithRoute<UniqueTopic[]>('eurovoc_topics');
}

export async function walo_questions() {
  return getWithRoute<WaloQuestion[]>('walo_questions', '');
}

// --- Delegates -------------------------------------------------------------

export async function delegates() {
  return getWithRoute<Delegate[]>('v1/delegates/all_active');
}

export async function delegate_by_id(delegate_id: number) {
  return getWithRoute<Delegate>(`v1/delegates/id/${delegate_id}`);
}

export async function delegate_interests(delegate_id: number) {
  return getWithRoute<InterestShare[]>(`delegate_interests?delegate_id=${delegate_id}`);
}

export async function general_delegate_info(delegate_id: number) {
  return getWithRoute<GeneralDelegateInfo>(`v1/delegates/extend/${delegate_id}`);
}

export async function delegate_qa(delegate_id: number) {
  return getWithRoute<DelegateQA[]>(`v1/delegates/delegate_qa/${delegate_id}`);
}

export async function delegates_at(date_at: string) {
  return getWithRoute<Delegate[]>(`v1/delegates/all_at_date?at=${date_at}`);
}

export async function delegates_with_seats_near_date(date_at: Date, gp: string) {
  return getWithRoute<Delegate[]>(
    `v1/delegates/all_at_date_with_seat_info?at=${date_at}&period=${gp}`
  );
}

export async function speeches_by_delegate_per_page(delegate_id: number, page: number) {
  return getWithRoute<SpeechesWithMaxPage>(
    `v1/delegates/speeches_per_page?delegate_id=${delegate_id}&page=${page}`
  );
}

/** Mirrors the web app's query-string construction exactly — the API is picky. */
export async function delegates_search_persons(
  page: number,
  entries_per_page: number,
  name: string | null = null,
  searchPeriods: string[] = [],
  searchParties: string[] = [],
  onlyGov: boolean | null = null,
  mindPreviousPartyMembership: boolean = true,
  hasActiveMandate: boolean | null = null
) {
  let query = `v1/delegates/search?page=${page}&entries_per_page=${entries_per_page}`;
  if (name) query += `&search=${encodeURIComponent(name)}`;

  searchPeriods.forEach((searchPeriod, i) => {
    const gps = onlyGov ? 'active_gov_gps' : 'active_gps';
    query += `&${gps}[in][${i}]=${encodeURIComponent(searchPeriod)}`;
  });

  searchParties.forEach((party, i) => {
    if (mindPreviousPartyMembership) {
      query += `&mandates[0][party][in][${i}]=${encodeURIComponent(party)}`;
    } else {
      query += `&party[in][${i}]=${encodeURIComponent(party)}`;
    }
  });

  if (onlyGov !== null) {
    query += `&mandates[0][is_gov_official][eq]=${onlyGov}`;
  }
  if (hasActiveMandate !== null) {
    query += `&is_active[eq]=${hasActiveMandate}`;
  }

  return getWithRoute<DelegatesWithMaxPage>(query);
}

// --- Government officials --------------------------------------------------

export async function gov_officials_at(date_at: string) {
  return getWithRoute<Delegate[]>(`v1/delegates/gov_officials/all_at_date?at=${date_at}`);
}

export async function gov_proposals_by_official(delegate_id: number) {
  return getWithRoute<GovProposal[]>(`v1/delegates/gov_officials/gov_proposals/${delegate_id}`);
}

export async function general_gov_official_info(delegate_id: number) {
  return getWithRoute<GeneralGovOfficialInfo>(`v1/delegates/gov_officials/extend/${delegate_id}`);
}

// --- Vote results ----------------------------------------------------------

export async function latest_vote_results() {
  return getWithRoute<VoteResult[]>('v1/vote_results/latest');
}

export async function vote_result_by_id(vote_result_id: string) {
  return getWithRoute<VoteResult>(`v1/vote_results/id/${vote_result_id}`);
}

export async function vote_result_by_path(gp: string, ityp: string, inr: string) {
  return getWithRoute<VoteResult>(`v1/vote_results/${gp}/${ityp}/${inr}`);
}

export async function vote_results_per_page(page: number, filter: VoteResultFilter | null) {
  return justPost<VoteResultsWithMaxPage>(`v1/vote_results/live/?page=${page}`, filter);
}

export async function vote_results_by_search(
  page: number,
  search: string,
  filter: VoteResultFilter | null
) {
  return justPost<VoteResultsWithMaxPage>(
    `v1/vote_results/search?page=${page}&search=${search}`,
    filter
  );
}

export async function vote_results_by_query_search(query: string) {
  return getWithRoute<VoteResultsWithMaxPage>(`v1/vote_results/search?${query}`);
}

// --- Ministerial proposals & decrees ---------------------------------------

export async function latest_ministrial_proposals(days: number) {
  return getWithRoute<GovProposalDelegate[]>(`v1/gov_proposals/latest?days=${days}`);
}

export async function latest_decrees(days: number) {
  return getWithRoute<Decree[]>(`v1/decrees/latest?days=${days}`);
}

export async function gov_proposals_per_page(page: number, filter: GovPropFilter | null) {
  return justPost<GovProposalsWithMaxPage>(`v1/gov_proposals/live/?page=${page}`, filter);
}

export async function gov_proposals_by_search(query: string) {
  return getWithRoute<GovProposalsWithMaxPage>(`v1/gov_proposals/search?${query}`);
}
