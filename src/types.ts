import { BigNumber } from 'utils/bignumber';

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

export interface BlockchainValue {
  value: any;
  blockNumber: number;
}

export interface Vote {
  voter: string;
  vote: number;
  amount: BigNumber;
  proposalId: string;
  preBoosted: boolean;
  block: number;
  tx: string;
}

export interface Stake {
  staker: string;
  amount: BigNumber;
  vote: number;
  proposalId: string;
  amount4Bounty: BigNumber;
  block: number;
  tx: string;
}

export interface ProposalStateChange {
  state: string;
  proposalId: string;
  block: number;
  tx: string;
}

export interface Redeem {
  beneficiary: string;
  amount: BigNumber;
  proposalId: string;
  block: number;
  tx: string;
}

export interface RedeemRep {
  beneficiary: string;
  amount: BigNumber;
  proposalId: string;
  block: number;
  tx: string;
}

export enum SchemeProposalState { Submitted, Passed, Failed, Executed }

export enum VotingMachineProposalState { 
  None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod
}

export interface ProposalInfo {
  id: string;
  scheme: string;
  to: string[];
  callData: string[];
  values: BigNumber[];
  stateInScheme: SchemeProposalState;
  stateInVotingMachine: VotingMachineProposalState;
  descriptionHash: string;
  creationBlock: BigNumber;
  repAtCreation: BigNumber;
  winningVote: number;
  proposer: string;
  currentBoostedVotePeriodLimit: BigNumber;
  paramsHash: string;
  daoBountyRemain: BigNumber;
  daoBounty: BigNumber;
  totalStakes: BigNumber;
  confidenceThreshold: BigNumber;
  secondsFromTimeOutTillExecuteBoosted: BigNumber;
  submittedTime: BigNumber;
  boostedPhaseTime: BigNumber;
  preBoostedPhaseTime: BigNumber;
  daoRedeemItsWinnings: boolean;
  status: string;
  statusPriority: number;
  boostTime: number;
  finishTime: number;
  shouldBoost: boolean,
  positiveVotes: BigNumber;
  negativeVotes: BigNumber;
  preBoostedPositiveVotes: BigNumber;
  preBoostedNegativeVotes: BigNumber;
  positiveStakes: BigNumber;
  negativeStakes: BigNumber;
  tokenRewards: {[address: string]: boolean};
  repRewards: {[address: string]: boolean};
}

export interface SchemeParameters {
  queuedVoteRequiredPercentage: BigNumber;
  queuedVotePeriodLimit: BigNumber;
  boostedVotePeriodLimit: BigNumber;
  preBoostedVotePeriodLimit: BigNumber;
  thresholdConst: BigNumber;
  limitExponentValue: BigNumber;
  quietEndingPeriod: BigNumber;
  proposingRepReward: BigNumber;
  votersReputationLossRatio: BigNumber;
  minimumDaoBounty: BigNumber;
  daoBountyConst: BigNumber;
  activationTime: BigNumber;
}

export interface SchemePermissions {
  canGenericCall: boolean;
  canUpgrade: boolean;
  canChangeConstraints: boolean;
  canRegisterSchemes: boolean;
}

export interface SchemeInfo {
  address: string;
  name: string,
  parametersHash: string;
  controllerAddress: string;
  ethBalance: BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposals: ProposalInfo[];
  proposalIds: string[];
  boostedProposals: number;
}

export interface DaoInfo {
  address: string;
  totalRep: BigNumber;
  ethBalance: BigNumber;
  userEthBalance: BigNumber;
  userRep: BigNumber;
  userVotingMachineTokenBalance: BigNumber;
  userVotingMachineTokenApproved: BigNumber;
}

export interface DaoCache {
  daoInfo: DaoInfo
  schemes: {[address: string]: SchemeInfo};
  proposals: {[id: string]: ProposalInfo};
  blockNumber: number;
  votes: Vote[];
  stakes: Stake[];
  redeems: Redeem[];
  redeemsRep: RedeemRep[];
  proposalStateChanges: ProposalStateChange[];
}
