/**
 * Query-string builders for the two search endpoints, ported from
 * somes-frontend's `convertVoteResultFilterToUrl` and `convertGovPropFilterToUrl`.
 *
 * The web builds a `URL` and reads `.search`; we return the string directly.
 * Parameters are assembled by hand with `encodeURIComponent`, the way
 * `delegates_search_persons` in `src/api/api.ts` already does — Hermes ships an
 * incomplete `URLSearchParams` polyfill and the bracket-heavy names below are
 * load-bearing. They must stay byte-identical to the web's, or the API quietly
 * ignores them and returns unfiltered results.
 */
import type { PartyVote } from '@/types';

/** The web's `legisPeriodFilter` opens on the current period, not on "Alle". */
export const DEFAULT_GP = 'XXVIII';

/**
 * The one deliberate divergence from somes-frontend.
 *
 * The web uses `[cn]` (contains) for topics. That operator currently makes the
 * API return `{"error_type":"FilterError","field":"MeilisearchFailure"}` on
 * both `v1/vote_results/search` and `v1/gov_proposals/search` — so the topic
 * filter is broken on somes.at itself right now. `[eq]` works, and is the
 * better fit anyway: the values come from the `eurovoc_topics` endpoint, so we
 * are picking exact topics from a list rather than matching substrings.
 * Several topics OR together, which is what the multi-select implies.
 *
 * If the backend fixes `[cn]`, this is the single line to reconsider.
 */
const TOPIC_OP = 'eq';

export type VoteFilters = {
  /** null means "Alle" — the parameter is omitted entirely. */
  gp: string | null;
  /** 'a' angenommen, 'd' abgelehnt, 'p' frühzeitig abgelehnt. */
  accepted: string | null;
  /** 'Law' | 'Resolution' | 'Amendment' | 'Report'. */
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

/**
 * The web sorts by date only when nothing was typed, so that a search falls back
 * to Meilisearch's relevance ordering. Reproduced deliberately.
 */
function baseParams(page: number, search: string): string[] {
  const parts = [`page=${page}`];
  if (search.length === 0) parts.push(param('sort', 'Desc'));
  parts.push(param('search', search));
  return parts;
}

export function voteResultsQuery(filters: VoteFilters, search: string, page: number): string {
  const parts = baseParams(page, search);

  // `/history/votes` appends this to every request; unfinished votes live on
  // their own route we do not mirror.
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
  // The web only ever sets this when true — "ohne Abstimmung" is not expressible.
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

/**
 * How many filters each of the three buttons currently holds, so the label can
 * read "Filter (2)" — the web shows the same count in `FilterDropdown`.
 *
 * The legislative period is excluded: it always has a value, so counting it
 * would leave the button permanently reading "(1)".
 */
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

/**
 * Delegate filters.
 *
 * There is deliberately no `delegatesQuery()` beside the two builders above:
 * `v1/delegates/search` is reached through `delegates_search_persons()`, which
 * takes positional arguments and assembles its own bracket parameters — the web
 * does the same, and keeping the two diffable matters more than symmetry here.
 * This type only carries the screen's filter state and its badge count.
 */
export type DelegateFilters = {
  /** null means "Alle Perioden" — no `active_gps` parameter is sent. */
  gp: string | null;
  parties: string[];
  /** "Mandatsart": true Regierung, false Nationalrat, null egal. */
  onlyGov: boolean | null;
  hasActiveMandate: boolean | null;
  /**
   * "Ehemalige Parteizugehörigkeit beachten". On, the party filter matches any
   * mandate's party; off, only the member's current one.
   */
  mindPreviousPartyMembership: boolean;
};

export const emptyDelegateFilters: DelegateFilters = {
  gp: DEFAULT_GP,
  parties: [],
  onlyGov: null,
  hasActiveMandate: null,
  mindPreviousPartyMembership: true,
};

/**
 * The single "Filter" pill holds everything except the party chips, which sit
 * in their own row. The period is excluded for the same reason as on the other
 * two screens: it always has a value.
 */
export function delegateFilterCounts(filters: DelegateFilters) {
  return {
    parties: filters.parties.length,
    generic:
      [filters.onlyGov, filters.hasActiveMandate].filter((value) => value !== null).length +
      (filters.mindPreviousPartyMembership ? 0 : 1),
  };
}
