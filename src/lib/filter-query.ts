/* the search endpoints take a bracketed filter syntax rather than plain parameters,
   the library's client serialises whatever record it is handed, so these builders
   only have to name the keys. the names have to stay byte identical or the api
   silently ignores them */
import type { Country, QueryParams } from '@som-es/somes-ts';

import type { PartyVote } from '@/types';

/** the web opens on the current period, not on alle. EU periods are plain integers
    ("10"), not AT's roman-numeral scheme ("XXVIII") */
export const DEFAULT_GP: Record<Country, string> = { at: 'XXVIII', eu: '10' };

export type VoteFilters = {
  /** null means alle, the parameter is left out */
  gp: string | null;
  /** a angenommen, d abgelehnt, p frühzeitig abgelehnt */
  accepted: string | null;
  /** law, resolution, amendment or report */
  voteType: string | null;
  simpleMajority: boolean | null;
  /** true named (roll call) votes, false anonymous party votes, null egal */
  votedByName: boolean | null;
  topics: string[];
  partyVotes: PartyVote[];
};

export type ProposalFilters = {
  gp: string | null;
  hasVoteResult: boolean | null;
  topics: string[];
  departments: string[];
};

export function emptyVoteFilters(country: Country): VoteFilters {
  return {
    gp: DEFAULT_GP[country],
    accepted: null,
    voteType: null,
    simpleMajority: null,
    votedByName: null,
    topics: [],
    partyVotes: [],
  };
}

export function emptyProposalFilters(country: Country): ProposalFilters {
  return {
    gp: DEFAULT_GP[country],
    hasVoteResult: null,
    topics: [],
    departments: [],
  };
}

/** sort by date only when nothing was typed, so a search keeps the relevance order */
function baseParams(page: number, search: string): QueryParams {
  return search.length === 0 ? { page, sort: 'Desc', search } : { page, search };
}

export function voteResultsQuery(
  filters: VoteFilters,
  search: string,
  page: number
): QueryParams {
  const query: QueryParams = {
    ...baseParams(page, search),
    // required, the endpoint answers 400 without it, and unfinished votes live elsewhere
    is_finished: true,
  };

  if (filters.gp) {
    query['legislative_initiative[gp][in][0]'] = filters.gp;
  }
  if (filters.accepted !== null) {
    query['legislative_initiative[accepted][eq]'] = filters.accepted;
  }
  if (filters.voteType !== null) {
    query['legislative_initiative[voting][in][0]'] = filters.voteType;
  }
  if (filters.simpleMajority !== null) {
    query['legislative_initiative[requires_simple_majority][eq]'] = filters.simpleMajority;
  }

  if (filters.votedByName !== null) {
    query['legislative_initiative[voted_by_name][eq]'] = filters.votedByName;
  }

  filters.partyVotes.forEach((partyVote, i) => {
    query[`party_votes[${i}][infavor]`] = partyVote.infavor;
    query[`party_votes[${i}][party]`] = partyVote.party;
  });

  filters.topics.forEach((topic, i) => {
    query[`filter_topics[${i}]`] = topic;
  });

  return query;
}

export function govProposalsQuery(
  filters: ProposalFilters,
  search: string,
  page: number
): QueryParams {
  const query: QueryParams = baseParams(page, search);

  if (filters.gp) {
    query['gov_proposal[ministrial_proposal][gp][in][0]'] = filters.gp;
  }
  // the web only ever sets this when true, ohne abstimmung cannot be expressed
  if (filters.hasVoteResult) {
    query['gov_proposal[ministrial_proposal][has_vote_result][eq]'] = true;
  }

  filters.topics.forEach((topic, i) => {
    query[`filter_topics[${i}]`] = topic;
  });

  filters.departments.forEach((department, i) => {
    query[`gov_proposal[ministrial_proposal][ressort][in][${i}]`] = department;
  });

  return query;
}

/** filter count per button, the period is left out since it always has a value and
    the button would permanently read (1) */
export function voteFilterCounts(filters: VoteFilters) {
  return {
    topics: filters.topics.length,
    parties: filters.partyVotes.length,
    generic: [filters.accepted, filters.voteType, filters.simpleMajority, filters.votedByName].filter(
      (value) => value !== null
    ).length,
  };
}

export function proposalFilterCounts(filters: ProposalFilters) {
  return {
    topics: filters.topics.length,
    ministries: filters.departments.length,
    generic: filters.hasVoteResult ? 1 : 0,
  };
}

/** delegate filters, the search itself goes through somes.delegates.search which
    builds its own parameters, so there is no query builder beside the other two */
export type DelegateFilters = {
  /** null means alle perioden, no active_gps parameter is sent */
  gp: string | null;
  parties: string[];
  /** mandatsart, true regierung, false nationalrat, null egal */
  onlyGov: boolean | null;
  hasActiveMandate: boolean | null;
  /** ehemalige parteizugehörigkeit, on means the party filter matches any mandate */
  mindPreviousPartyMembership: boolean;
};

export function emptyDelegateFilters(country: Country): DelegateFilters {
  return {
    gp: DEFAULT_GP[country],
    parties: [],
    onlyGov: null,
    hasActiveMandate: null,
    mindPreviousPartyMembership: true,
  };
}

export function delegateFilterCounts(filters: DelegateFilters) {
  return {
    parties: filters.parties.length,
    generic:
      [filters.onlyGov, filters.hasActiveMandate].filter((value) => value !== null).length +
      (filters.mindPreviousPartyMembership ? 0 : 1),
  };
}
