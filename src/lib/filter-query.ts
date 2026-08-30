/* ported from the two url builders in somes-frontend, built by hand with
   encodeuricomponent since hermes has an incomplete urlsearchparams and the bracket
   names have to stay byte identical or the api just ignores them */
import type { PartyVote } from '@/types';

/** the web opens on the current period, not on alle */
export const DEFAULT_GP = 'XXVIII';

/** eq, not the cn the web uses, cn makes both search endpoints fail so topic
    filtering is broken on somes.at itself */
const TOPIC_OP = 'eq';

export type VoteFilters = {
  /** null means alle, the parameter is left out */
  gp: string | null;
  /** a angenommen, d abgelehnt, p frühzeitig abgelehnt */
  accepted: string | null;
  /** law, resolution, amendment or report */
  voteType: string | null;
  simpleMajority: boolean | null;
  topics: string[];
  partyVotes: PartyVote[];
};

export type ProposalFilters = {
  gp: string | null;
  hasVoteResult: boolean | null;
  topics: string[];
  departments: string[];
};

export const emptyVoteFilters: VoteFilters = {
  gp: DEFAULT_GP,
  accepted: null,
  voteType: null,
  simpleMajority: null,
  topics: [],
  partyVotes: [],
};

export const emptyProposalFilters: ProposalFilters = {
  gp: DEFAULT_GP,
  hasVoteResult: null,
  topics: [],
  departments: [],
};

function param(key: string, value: string): string {
  return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

/** sort by date only when nothing was typed, so a search keeps the relevance order */
function baseParams(page: number, search: string): string[] {
  const parts = [`page=${page}`];
  if (search.length === 0) parts.push(param('sort', 'Desc'));
  parts.push(param('search', search));
  return parts;
}

export function voteResultsQuery(filters: VoteFilters, search: string, page: number): string {
  const parts = baseParams(page, search);

  // the web appends this to every request, unfinished votes live elsewhere
  parts.push(param('is_finished', 'true'));

  if (filters.gp) {
    parts.push(param('legislative_initiative[gp][in][0]', filters.gp));
  }
  if (filters.accepted !== null) {
    parts.push(param('legislative_initiative[accepted][eq]', filters.accepted));
  }
  if (filters.voteType !== null) {
    parts.push(param('legislative_initiative[voting][in][0]', filters.voteType));
  }
  if (filters.simpleMajority !== null) {
    parts.push(
      param(
        'legislative_initiative[requires_simple_majority][eq]',
        String(filters.simpleMajority)
      )
    );
  }

  filters.partyVotes.forEach((partyVote, i) => {
    parts.push(param(`party_votes[${i}][infavor]`, String(partyVote.infavor)));
    parts.push(param(`party_votes[${i}][party]`, partyVote.party));
  });

  filters.topics.forEach((topic, i) => {
    parts.push(param(`eurovoc_topics[${i}][topic][${TOPIC_OP}]`, topic));
  });

  return parts.join('&');
}

export function govProposalsQuery(
  filters: ProposalFilters,
  search: string,
  page: number
): string {
  const parts = baseParams(page, search);

  if (filters.gp) {
    parts.push(param('gov_proposal[ministrial_proposal][gp][in][0]', filters.gp));
  }
  // the web only ever sets this when true, ohne abstimmung cannot be expressed
  if (filters.hasVoteResult) {
    parts.push(param('gov_proposal[ministrial_proposal][has_vote_result][eq]', 'true'));
  }

  filters.topics.forEach((topic, i) => {
    parts.push(param(`gov_proposal[eurovoc_topics][${i}][topic][${TOPIC_OP}]`, topic));
  });

  filters.departments.forEach((department, i) => {
    parts.push(param(`gov_proposal[ministrial_proposal][ressort][in][${i}]`, department));
  });

  return parts.join('&');
}

/** filter count per button, the period is left out since it always has a value and
    the button would permanently read (1) */
export function voteFilterCounts(filters: VoteFilters) {
  return {
    topics: filters.topics.length,
    parties: filters.partyVotes.length,
    generic: [filters.accepted, filters.voteType, filters.simpleMajority].filter(
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

/** delegate filters, the search itself goes through delegates_search_persons which
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

export const emptyDelegateFilters: DelegateFilters = {
  gp: DEFAULT_GP,
  parties: [],
  onlyGov: null,
  hasActiveMandate: null,
  mindPreviousPartyMembership: true,
};

export function delegateFilterCounts(filters: DelegateFilters) {
  return {
    parties: filters.parties.length,
    generic:
      [filters.onlyGov, filters.hasActiveMandate].filter((value) => value !== null).length +
      (filters.mindPreviousPartyMembership ? 0 : 1),
  };
}
