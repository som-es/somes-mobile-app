import {
  delegateFilterCounts,
  DEFAULT_GP,
  emptyDelegateFilters,
  emptyProposalFilters,
  emptyVoteFilters,
  govProposalsQuery,
  proposalFilterCounts,
  voteFilterCounts,
  voteResultsQuery,
} from '@/lib/filter-query';

describe('voteResultsQuery', () => {
  it('sorts by date and omits filter keys when filters are empty and search is blank', () => {
    const query = voteResultsQuery(emptyVoteFilters('at'), '', 1);

    expect(query).toEqual({
      page: 1,
      sort: 'Desc',
      search: '',
      is_finished: true,
      'legislative_initiative[gp][in][0]': 'XXVIII',
    });
  });

  it('sends the named vote filter only when set', () => {
    const named = voteResultsQuery({ ...emptyVoteFilters('at'), votedByName: true }, '', 1);
    const anonymous = voteResultsQuery({ ...emptyVoteFilters('at'), votedByName: false }, '', 1);

    expect(named['legislative_initiative[voted_by_name][eq]']).toBe(true);
    expect(anonymous['legislative_initiative[voted_by_name][eq]']).toBe(false);
    expect(voteResultsQuery(emptyVoteFilters('at'), '', 1)).not.toHaveProperty(
      'legislative_initiative[voted_by_name][eq]'
    );
  });

  it('drops the sort key once a search term is present', () => {
    const query = voteResultsQuery(emptyVoteFilters('at'), 'klima', 1);

    expect(query.sort).toBeUndefined();
    expect(query.search).toBe('klima');
  });

  it('omits the gp key when gp is null', () => {
    const query = voteResultsQuery({ ...emptyVoteFilters('at'), gp: null }, '', 1);

    expect(query['legislative_initiative[gp][in][0]']).toBeUndefined();
  });

  it('adds accepted, voteType and simpleMajority keys only when set', () => {
    const query = voteResultsQuery(
      { ...emptyVoteFilters('at'), accepted: 'a', voteType: 'Law', simpleMajority: false },
      '',
      1
    );

    expect(query['legislative_initiative[accepted][eq]']).toBe('a');
    expect(query['legislative_initiative[voting][in][0]']).toBe('Law');
    // false is a set value, distinct from null (unset)
    expect(query['legislative_initiative[requires_simple_majority][eq]']).toBe(false);
  });

  it('expands partyVotes into indexed bracket keys', () => {
    const query = voteResultsQuery(
      {
        ...emptyVoteFilters('at'),
        partyVotes: [
          { party: 'A', infavor: true },
          { party: 'B', infavor: false },
        ],
      },
      '',
      1
    );

    expect(query['party_votes[0][infavor]']).toBe(true);
    expect(query['party_votes[0][party]']).toBe('A');
    expect(query['party_votes[1][infavor]']).toBe(false);
    expect(query['party_votes[1][party]']).toBe('B');
  });

  it('expands topics into indexed eq-operator bracket keys', () => {
    const query = voteResultsQuery({ ...emptyVoteFilters('at'), topics: ['ENV', 'TAX'] }, '', 1);

    expect(query['eurovoc_topics[0][topic][eq]']).toBe('ENV');
    expect(query['eurovoc_topics[1][topic][eq]']).toBe('TAX');
  });
});

describe('govProposalsQuery', () => {
  it('only adds has_vote_result when true, never when false', () => {
    const withFalse = govProposalsQuery(
      { ...emptyProposalFilters('at'), hasVoteResult: false },
      '',
      1
    );
    const withNull = govProposalsQuery(
      { ...emptyProposalFilters('at'), hasVoteResult: null },
      '',
      1
    );
    const withTrue = govProposalsQuery(
      { ...emptyProposalFilters('at'), hasVoteResult: true },
      '',
      1
    );

    expect(withFalse['gov_proposal[ministrial_proposal][has_vote_result][eq]']).toBeUndefined();
    expect(withNull['gov_proposal[ministrial_proposal][has_vote_result][eq]']).toBeUndefined();
    expect(withTrue['gov_proposal[ministrial_proposal][has_vote_result][eq]']).toBe(true);
  });

  it('expands topics and departments into indexed bracket keys', () => {
    const query = govProposalsQuery(
      { ...emptyProposalFilters('at'), topics: ['ENV'], departments: ['BMF', 'BMI'] },
      '',
      1
    );

    expect(query['gov_proposal[eurovoc_topics][0][topic][eq]']).toBe('ENV');
    expect(query['gov_proposal[ministrial_proposal][ressort][in][0]']).toBe('BMF');
    expect(query['gov_proposal[ministrial_proposal][ressort][in][1]']).toBe('BMI');
  });
});

describe('voteFilterCounts', () => {
  it('counts array lengths and only non-null generic fields', () => {
    expect(voteFilterCounts(emptyVoteFilters('at'))).toEqual({
      topics: 0,
      parties: 0,
      generic: 0,
    });

    expect(
      voteFilterCounts({
        ...emptyVoteFilters('at'),
        topics: ['a', 'b'],
        partyVotes: [{ party: 'A', infavor: true }],
        accepted: 'a',
        voteType: null,
        simpleMajority: false,
      })
    ).toEqual({ topics: 2, parties: 1, generic: 2 });
  });
});

describe('proposalFilterCounts', () => {
  it('counts hasVoteResult as 1 only when true', () => {
    expect(proposalFilterCounts(emptyProposalFilters('at'))).toEqual({
      topics: 0,
      ministries: 0,
      generic: 0,
    });
    expect(
      proposalFilterCounts({ ...emptyProposalFilters('at'), hasVoteResult: false })
    ).toEqual({ topics: 0, ministries: 0, generic: 0 });
    expect(
      proposalFilterCounts({
        ...emptyProposalFilters('at'),
        hasVoteResult: true,
        departments: ['BMF'],
      })
    ).toEqual({ topics: 0, ministries: 1, generic: 1 });
  });
});

describe('delegateFilterCounts', () => {
  it('counts parties, generic boolean filters and the inverted membership flag', () => {
    expect(delegateFilterCounts(emptyDelegateFilters('at'))).toEqual({ parties: 0, generic: 0 });

    expect(
      delegateFilterCounts({
        ...emptyDelegateFilters('at'),
        parties: ['A'],
        onlyGov: true,
        hasActiveMandate: null,
        mindPreviousPartyMembership: false,
      })
    ).toEqual({ parties: 1, generic: 2 });
  });
});

describe('country-specific defaults', () => {
  it('defaults the vote gp to the eu legislative period', () => {
    expect(emptyVoteFilters('eu').gp).toBe(DEFAULT_GP.eu);
    expect(emptyVoteFilters('eu').gp).not.toBe(emptyVoteFilters('at').gp);
  });

  it('defaults the proposal gp to the eu legislative period', () => {
    expect(emptyProposalFilters('eu').gp).toBe(DEFAULT_GP.eu);
    expect(emptyProposalFilters('eu').gp).not.toBe(emptyProposalFilters('at').gp);
  });

  it('defaults the delegate gp to the eu legislative period', () => {
    expect(emptyDelegateFilters('eu').gp).toBe(DEFAULT_GP.eu);
    expect(emptyDelegateFilters('eu').gp).not.toBe(emptyDelegateFilters('at').gp);
  });
});
