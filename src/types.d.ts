import BigNumber from 'bignumber.js';
import { WalletSchemeProposalState, VotingMachineProposalState } from './enums';

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

export interface BlockchainValue {
  value: any;
  blockNumber: number;
}

export interface BlockchainEvent {
  event: string;
  signature: string;
  address: string;
  tx: string;
  block: number;
  transactionIndex: number;
  logIndex: number;
}

export interface ERC20TransferEvent extends BlockchainEvent{
  from: string;
  to: String;
  amount: BigNumber;
};

export interface RepEvent extends BlockchainEvent{
  account: string;
  amount: BigNumber;
};

export interface ProposalEvent extends BlockchainEvent {
  proposalId: string;
}

export interface Vote extends ProposalEvent {
  voter: string;
  vote: number;
  amount: BigNumber;
  preBoosted: boolean;
}

export interface Stake extends ProposalEvent {
  staker: string;
  amount: BigNumber;
  vote: number;
  amount4Bounty: BigNumber;
}

export interface ProposalStateChange extends ProposalEvent {
  state: string;
}

export interface Redeem extends ProposalEvent {
  beneficiary: string;
  amount: BigNumber;
}

export interface RedeemRep extends ProposalEvent {
  beneficiary: string;
  amount: BigNumber;
}

export interface Proposal{
  id: string;
  scheme: string;
  title: string;
  to: string[];
  callData: string[];
  values: BigNumber[];
  stateInScheme: WalletSchemeProposalState;
  stateInVotingMachine: VotingMachineProposalState;
  descriptionHash: string;
  creationEvent: BlockchainEvent;
  repAtCreation: BigNumber;
  winningVote: number;
  proposer: string;
  currentBoostedVotePeriodLimit: BigNumber;
  paramsHash: string,
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
  address: string;
  registered: boolean;
  name: string,
  type: string,
  controllerAddress: string;
  ethBalance: BigNumber;
  votingMachine: String;
  configurations: {
    paramsHash: string;
    parameters: SchemeParameters;
    permissions: SchemePermissions;
    boostedVoteRequiredPercentage: number;
    toBlock: number
  }[];
  callPermissions: SchemeCallPermission[];
  proposalIds: string[];
  boostedProposals: number;
  maxSecondsForExecution: BigNumber;
  maxRepPercentageChange: BigNumber;
  newProposalEvents: ProposalEvent[]
}

export interface User {
  repBalance: BigNumber;
  proposalsCreated: string[];
}

export interface DaoInfo {
  address: string;
  totalRep: BigNumber;
  repEvents: RepEvent[];
  ethBalance: BigNumber;
}

export interface IPFSHash {
  hash: string;
  type: string;
  name: string;
}

export interface DaoNetworkCache {
  blockNumber: number;
  daoInfo: DaoInfo;
  schemes: {[address: string]: Scheme};
  proposals: {[id: string]: Proposal};
  users: {[address: string]: User};
  votingMachines: {[address: string]: {
    name: string;
    events: {
      votes: Vote[];
      stakes: Stake[];
      redeems: Redeem[];
      redeemsRep: RedeemRep[];
      proposalStateChanges: ProposalStateChange[];
    };
    token: {
      address: string;
      totalSupply: BigNumber;
    };
  }};
  ipfsHashes: IPFSHash[];
};

export interface DaoCache {
  [network: string]: DaoNetworkCache;
}
