import { ContractType } from 'stores/Provider';
import {
  BigNumber,
  WalletSchemeProposalState,
  VotingMachineProposalState,
} from './utils';

declare global {
  // Window ethereum type

  interface Window {
    ethereum?: EthereumProvider;
  }

  // DaoStore types

  interface BlockchainEvent {
    event: string;
    signature: string;
    address: string;
    tx: string;
    blockNumber: number;
    timestamp: number;
    transactionIndex: number;
    logIndex: number;
  }

  interface ERC20TransferEvent extends BlockchainEvent {
    from: string;
    to: string;
    amount: BigNumber;
  }

  interface RepEvent extends BlockchainEvent {
    account: string;
    amount: BigNumber;
  }

  interface ProposalEvent extends BlockchainEvent {
    proposalId: string;
  }

  interface NewProposal extends ProposalEvent {
    proposer: string;
    paramHash: string;
  }

  interface Vote extends ProposalEvent {
    voter: string;
    vote: number;
    amount: BigNumber;
    preBoosted: boolean;
  }

  interface Stake extends ProposalEvent {
    staker: string;
    amount: BigNumber;
    vote: number;

    // this can be removed
    amount4Bounty: BigNumber;
  }

  interface ProposalStateChange extends ProposalEvent {
    state: string;
  }

  interface Redeem extends ProposalEvent {
    beneficiary: string;
    amount: BigNumber;
  }

  interface RedeemRep extends ProposalEvent {
    beneficiary: string;
    amount: BigNumber;
  }

  interface RedeemDaoBounty extends ProposalEvent {
    beneficiary: string;
    amount: BigNumber;
  }

  interface Proposal {
    id: string;
    scheme: string;
    title: string;
    to: string[];
    callData: string[];
    values: BigNumber[];
    descriptionHash: string;
    creationEvent: BlockchainEvent;
    winningVote: number;
    proposer: string;
    paramsHash: string;
    submittedTime: BigNumber;
    extraData?: any;

    // mutable data
    stateInScheme: WalletSchemeProposalState;
    stateInVotingMachine: VotingMachineProposalState;
    currentBoostedVotePeriodLimit: BigNumber;
    daoBountyRemain: BigNumber;
    daoBounty: BigNumber;
    confidenceThreshold: BigNumber;
    secondsFromTimeOutTillExecuteBoosted: BigNumber;
    boostedPhaseTime: BigNumber;
    preBoostedPhaseTime: BigNumber;
    daoRedeemItsWinnings: boolean;
    shouldBoost: boolean;
    positiveVotes: BigNumber;
    negativeVotes: BigNumber;
    positiveStakes: BigNumber;
    negativeStakes: BigNumber;
  }

  interface VotingMachineParameters {
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

  interface SchemePermissions {
    canGenericCall: boolean;
    canUpgrade: boolean;
    canChangeConstraints: boolean;
    canRegisterSchemes: boolean;
  }

  interface CallPermissions {
    [asset: string]: {
      [from: string]: {
        [to: string]: {
          [functionSignature: string]: {
            fromTime: BigNumber;
            value: BigNumber;
          };
        };
      };
    };
  }

  interface Scheme {
    address: string;
    name: string;
    type: string;
    controllerAddress: string;
    votingMachine: string;

    // mutable data
    registered: boolean;
    paramsHash: string;
    permissions: SchemePermissions;
    boostedVoteRequiredPercentage: number;
    proposalIds: string[];
    boostedProposals: number;
    maxSecondsForExecution: BigNumber;
    maxRepPercentageChange: BigNumber;
    newProposalEvents: ProposalEvent[];
  }

  interface VotingMachine {
    name: string;
    events: {
      votes: Vote[];
      stakes: Stake[];
      redeems: Redeem[];
      redeemsRep: RedeemRep[];
      redeemsDaoBounty: RedeemDaoBounty[];
      proposalStateChanges: ProposalStateChange[];
      newProposal: NewProposal[];
    };
    token: string;
    votingParameters: { [paramsHash: string]: VotingMachineParameters };
  }

  interface IPFSHash {
    hash: string;
    type: string;
    name: string;
  }

  interface DaoNetworkCache {
    version?: number;
    networkId: number;
    blockNumber: number;
    address: string;
    reputation: {
      events: RepEvent[],
      total: BigNumber
    },
    schemes: { [address: string]: Scheme };
    proposals: { [id: string]: Proposal };
    callPermissions: CallPermissions;
    votingMachines: { [address: string]: VotingMachine };
    ipfsHashes: IPFSHash[];
    vestingContracts: TokenVesting[];
  }

  // Application Config

  interface NetworkContracts {
    avatar: string;
    reputation: string;
    token: string;
    controller: string;
    permissionRegistry: string;
    utils: { [name: string]: string };
    votingMachines: {
      [address: string]: {
        type: string;
        token: string;
      };
    };
    daostack?: {
      [address: string] : {
        supported: boolean,
        name: string,
        type: string,
        contractToCall: string,
        creationLogEncoding: Array<Array<{
          name: string,
          type: string
        }>>,
        newProposalTopics: string[],
        voteParams: string,
        votingMachine: string,
        redeemer?: string
      }
    },
  }

  interface NetworkConfig {
    version?: number;
    cache: {
      fromBlock: number;
      toBlock: number;
      ipfsHash: string;
    };
    contracts: NetworkContracts;
    recommendedCalls: {
      asset: string;
      from: string;
      to: string;
      toName: string;
      functionName: string;
      params: {
        type: string;
        name: string;
        defaultValue: string;
        decimals?: number;
      }[];
      decodeText: string;
    }[];
    proposalTemplates: {
      name: string;
      title: string;
      description: string;
      calls?: array;
    }[];
    contributionLevels: {
      id: string;
      dxd: number;
      stable: number;
      rep: number;
    }[];
    proposalTypes: {
      id: string;
      title: string;
      scheme?: string;
    }[];
    tokens: {
      address: string;
      name: string;
      decimals: number;
      symbol: string;
      fetchPrice: boolean;
      logoURI?: string;
    }[];
  }

  interface AppConfig {
    [networkName: string]: NetworkConfig;
  }
}

export interface TokenVesting {
  address: string;
  beneficiary: string;
  cliff: string;
  duration: string;
  owner: string;
  value?: BigNumber;
  start: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  displayName: string;
  rpcUrl?: string;
  defaultRpc: string;
  nativeAsset: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer?: string;
  api?: string;
  icon?: string;
}

// hook types

export interface ProposalCalls {
  from: string;
  to: string;
  data: string;
  value: BigNumber;
  recommendedCallUsed?: RecommendedCallUsed | undefined;
  callParameters?: unknown | undefined;
  encodedFunctionName?: string | undefined;
  contractABI: any;
}

export interface CallParameterDefinition {
  type: string;
  name: string;
  defaultValue: string;
  decimals?: number;
  isRep?: boolean;
}

export interface RecommendedCallUsed {
  asset: string;
  from: string;
  to: string;
  toName: string;
  functionName: string;
  params: CallParameterDefinition[];
  decodeText: string;
}

export interface ProposalStatus {
  boostTime: BigNumber;
  finishTime: BigNumber;
  status: string;
  pendingAction: number;
}

export type ProposalsExtended = Proposal &
  ProposalStateChange &
  VotingMachineParameters &
  ProposalStatus &
  Pick<Scheme, 'maxSecondsForExecution' | 'type'> & {
    autoBoost: Boolean;
  };
