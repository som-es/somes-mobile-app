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
  PlenarDate,
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

// --- plenary sessions ------------------------------------------------------
export async function next_plenar_date() {
  return getWithRoute<PlenarDate>('next_plenar_date');
}

// --- delegates -------------------------------------------------------------
export async function delegates() {
  return getWithRoute<Delegate[]>('v1/delegates/all_active');
}

export async function delegate_by_id(delegate_id: number) {
  return getWithRoute<Delegate>(`v1/delegates/id/${delegate_id}`);
}

export async function delegate_interests(delegate_id: number) {
  return getWithRoute<InterestShare[]>(`delegate_interests?delegate_id=${delegate_id}`);
}

export async function general_delegate_info(delegate_id: number, language = 'de') {
  return getWithRoute<GeneralDelegateInfo>(
    `v1/delegates/extend/${delegate_id}?language=${language}`
  );
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

function param(key: string, value: string): string {
  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

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
  const parts = [`page=${page}`, `entries_per_page=${entries_per_page}`];
  if (name) parts.push(param('search', name));

  searchPeriods.forEach((searchPeriod, i) => {
    const gps = onlyGov ? 'active_gov_gps' : 'active_gps';
    parts.push(param(`${gps}[in][${i}]`, searchPeriod));
  });

  searchParties.forEach((party, i) => {
    parts.push(
      mindPreviousPartyMembership
        ? param(`mandates[0][party][in][${i}]`, party)
        : param(`party[in][${i}]`, party)
    );
  });

  if (onlyGov !== null) {
    parts.push(param('mandates[0][is_gov_official][eq]', String(onlyGov)));
  }
  if (hasActiveMandate !== null) {
    parts.push(param('is_active[eq]', String(hasActiveMandate)));
  }

  const query = `v1/delegates/search?${parts.join('&')}`;

  return getWithRoute<DelegatesWithMaxPage>(query);
}

// --- government officials --------------------------------------------------
export async function gov_officials_at(date_at: string) {
  return getWithRoute<Delegate[]>(`v1/delegates/gov_officials/all_at_date?at=${date_at}`);
}

export async function gov_proposals_by_official(delegate_id: number) {
  return getWithRoute<GovProposal[]>(`v1/delegates/gov_officials/gov_proposals/${delegate_id}`);
}

export async function general_gov_official_info(delegate_id: number) {
  return getWithRoute<GeneralGovOfficialInfo>(`v1/delegates/gov_officials/extend/${delegate_id}`);
}

// --- vote results ----------------------------------------------------------
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

// --- ministerial proposals and decrees ---------------------------------------
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

export async function gov_proposal_by_path(gp: string, inr: string) {
  return getWithRoute<GovProposalDelegate>(`v1/gov_proposals/${gp}/${inr}`);
}
