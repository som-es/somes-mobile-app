/* the wire types all come from @som-es/somes-ts, only the two shapes below are
   the app's own: one describes a filter the search endpoints take rather than a
   response, the other the flag struct somes-api hides in an error's meta */
export type {
  Absence,
  BasicUserInfo,
  Country,
  DbAiSummary,
  Decree,
  Delegate,
  DelegateFavo,
  DelegateQA,
  DelegatesWithMaxPage,
  Document,
  ExtendedUserInfo,
  GeneralDelegateInfo,
  GovProposal,
  GovProposalDelegate,
  GovProposalsWithMaxPage,
  InterestShare,
  LegisInitFavo,
  LegisPeriod,
  LegislativeInitiative,
  MailSendInfo,
  NamedVotes,
  Party,
  PartyStates,
  PlenarDate,
  PoliticalPosition,
  PoliticalScore,
  SpeechesWithMaxPage,
  StanceTopicInfluences,
  StanceTopicScore,
  Topic,
  UniqueTopic,
  Vote,
  VoteResult,
  VoteResultsWithMaxPage,
} from '@som-es/somes-ts';

/** the speech itself plus its ai summary, the library's name for it */
export type { FullSpeech as Speech } from '@som-es/somes-ts';

/** the delegate side named vote, the one nested in a vote result is NamedVotes */
export type { DelegateNamedVote as NamedVote } from '@som-es/somes-ts';

/** a party filter row, the search endpoints take these as bracketed parameters */
export interface PartyVote {
  party: string;
  infavor: boolean;
}

/** the flag struct somes-api puts in an error's meta, read it with signUpFlags */
export interface SignUpError {
  missing_username: boolean;
  missing_password: boolean;
  missing_email: boolean;
  username_taken: boolean;
  email_taken: boolean;
  invalid_email: boolean;
  invalid_otp: boolean;
  insufficient_password: boolean;
  is_erroneous: boolean;
}
