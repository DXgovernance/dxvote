import BigNumber from 'bignumber.js';

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

// Multicall Types 

export interface Call {
  contractType: string;
  address: string;
  method: string;
  params?: any[];
}

export interface CallValue {
  value: any;
  lastFetched: number;
}

export interface CallEntry extends Call {
  response: CallValue;
}

// BlockchainStore Types

export interface EventStorage {
  [address: string]: {
    [eventName: string]: {
      emitions: any[];
      fromBlock: number;
      toBlock: number;
    }
  } 
};

export interface ContractStorage {
  [contractType: string]: {
    [address: string]: {
      [method: string]: {
        [parameters: string]: CallValue
      }
    }
  }
};

// DaoStore types

export interface UserInfo {
  address: string,
  ethBalance: BigNumber;
  repBalance: BigNumber;
  dxdBalance: BigNumber;
  dxdApproved: BigNumber;
}

export interface BlockchainValue {
  value: any;
  blockNumber: number;
}

export interface RepEvent {
  type: string;
  account: string;
  amount: BigNumber;
  tx: string;
  block: number;
  transactionIndex: number;
  logIndex: number;
};

export interface VotingMachineEvent {
  proposalId: string;
  tx: string;
  block: number;
  transactionIndex: number;
  logIndex: number;
}

export interface Vote extends VotingMachineEvent {
  voter: string;
  vote: number;
  amount: BigNumber;
  preBoosted: boolean;
}

export interface Stake extends VotingMachineEvent {
  staker: string;
  amount: BigNumber;
  vote: number;
  amount4Bounty: BigNumber;
}

export interface ProposalStateChange extends VotingMachineEvent {
  state: string;
}

export interface Redeem extends VotingMachineEvent {
  beneficiary: string;
  amount: BigNumber;
}

export interface RedeemRep extends VotingMachineEvent {
  beneficiary: string;
  amount: BigNumber;
}

enum SchemeProposalState { Submitted, Passed, Failed, Executed }

enum VotingMachineProposalState { 
  None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod
}

export interface Proposal{
  id: string;
  scheme: string;
  title: string;
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
  priority: number;
  boostTime: BigNumber;
  finishTime: BigNumber;
  shouldBoost: boolean,
  positiveVotes: BigNumber;
  negativeVotes: BigNumber;
  preBoostedPositiveVotes: BigNumber;
  preBoostedNegativeVotes: BigNumber;
  positiveStakes: BigNumber;
  negativeStakes: BigNumber;
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

export interface SchemeCallPermission {
  asset: string;
  to: string;
  functionSignature: string;
  fromTime: BigNumber;
  value: BigNumber;
}

export interface Scheme {
  registered: boolean;
  address: string;
  name: string,
  paramsHash: string;
  controllerAddress: string;
  ethBalance: BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposalIds: string[];
  boostedProposals: number;
  maxSecondsForExecution: BigNumber;
}

export interface DaoInfo {
  address: string;
  totalRep: BigNumber;
  repHolders: {[address: string]: BigNumber};
  repEvents: RepEvent[];
  ethBalance: BigNumber;
  dxdBalance: BigNumber;
}

export interface DaoNetworkCache {
  blockNumber: number;
  daoInfo: DaoInfo;
  schemes: {[address: string]: Scheme};
  proposals: {[id: string]: Proposal};
  callPermissions: { [from: string]: SchemeCallPermission[] };
  votingMachineEvents: {
    votes: Vote[];
    stakes: Stake[];
    redeems: Redeem[];
    redeemsRep: RedeemRep[];
    proposalStateChanges: ProposalStateChange[];
  }
};

export interface DaoCache {
  [network: string]: DaoNetworkCache;
}
