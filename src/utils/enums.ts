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
  Rejected,
  Passed,
}

export enum PendingAction {
  None,
  Boost,
  Execute,
  Finish,
  Redeem,
  RedeemForBeneficiary,
}

export const enumKeys = <O extends object, K extends keyof O = keyof O>(
  obj: O
): K[] => Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
