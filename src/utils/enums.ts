export enum Web3Errors {
  UNKNOWN_ERROR,
  SIGNATURE_REJECTED,
}
export enum TXEvents {
  TX_HASH = 'txhash',
  RECEIPT = 'receipt',
  CONFIRMATION = 'confirmation',
  TX_ERROR = 'txerror',
  FINALLY = 'finally',
  INVARIANT = 'invariant',
}

export enum VoteDecision {
  None,
  YES,
  NO,
}

export enum WalletSchemeProposalState {
  None,
  Submitted,
  Rejected,
  ExecutionSucceded,
  ExecutionTimeout,
}

export enum VotingMachineProposalState {
  None,
  ExpiredInQueue,
  Executed,
  Queued,
  PreBoosted,
  Boosted,
  QuietEndingPeriod,
}

export const enumKeys = <O extends object, K extends keyof O = keyof O>(
  obj: O
): K[] => Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];

export enum Status {
  ExpiredInQueue = 'Expired in Queue',
  Passed = 'Passed',
  ProposalRejected = 'Proposal Rejected',
  ExecutionSucceded = 'Execution Succeeded',
  InQueue = 'In Queue',
  ExecutionTimeout = 'Execution Timeout',
  PendingExecution = 'Pending Execution',
  PendingBoost = 'Pending Boost',
  PreBoosted = 'Pre Boosted',
  QuietEndingPeriod = 'Quiet Ending Period',
  Boosted = 'Boosted',
}
