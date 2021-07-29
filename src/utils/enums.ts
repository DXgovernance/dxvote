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
  NO
}

export enum WalletSchemeProposalState { None, Submitted, Rejected, ExecutionSucceded, ExecutionTimeout }

export enum VotingMachineProposalState { 
  None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod
}
