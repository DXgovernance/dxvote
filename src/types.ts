import { BigNumber } from 'utils/bignumber';
import { ValidationStatus } from './utils/validators';

export interface BigNumberMap {
    [index: string]: BigNumber;
}

export interface StringMap {
    [index: string]: string;
}

export interface NumberMap {
    [index: string]: number;
}

export interface MarketAssetMap {
    [index: string]: MarketAsset;
}

export interface MarketAsset {
    id: string;
    symbol: string;
    name: string;
    price?: MarketAssetPrice;
}

export interface MarketAssetPrice {
    value: BigNumber;
    currency: string;
}

// Indexed by Symbol
export interface MarketAssetPriceMap {
    [index: string]: MarketAssetPrice;
}

// Token Address -> checked
export interface CheckboxMap {
    [index: string]: Checkbox;
}

// Token -> amount
export interface InputMap {
    [index: string]: Input;
}

export interface Input {
    value: string;
    touched: boolean;
    validation: ValidationStatus;
}

export interface Checkbox {
    checked: boolean;
    touched: boolean;
}

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

export type TxHash = string;

export interface TransactionEvent {
    type: TXEvents;
    data: any;
}


export interface BlockchainValue {
  value: any;
  blockNumber: Number;
}

export enum SchemeProposalState { Submitted, Passed, Failed, Executed }
export enum VotingMachineProposalState { None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod}

export interface Vote {
  voter: string;
  vote: Number;
  amount: BigNumber;
  proposalId: string;
  preBoosted: boolean;
  block: number;
  tx: string;
}

export interface Stake {
  staker: string;
  amount: BigNumber;
  vote: Number;
  proposalId: string;
  amount4Bounty: BigNumber;
  block: number;
  tx: string;
}

export interface StateChange {
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

export interface ProposalInfo {
  id: string;
  scheme: string;
  to: String[];
  callData: String[];
  values: BigNumber[];
  stateInScheme: SchemeProposalState;
  stateInVotingMachine: VotingMachineProposalState;
  descriptionHash: String;
  creationBlock: BigNumber;
  repAtCreation: BigNumber;
  winningVote: Number;
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
  statusPriority: Number;
  boostTime: Number;
  finishTime: Number;
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
  address: String;
  name: String,
  parametersHash: string;
  controllerAddress: string;
  ethBalance: BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposals: ProposalInfo[];
  proposalIds: String[];
  boostedProposals: Number;
  blockNumber: Number;
}

export interface DaoInfo {
  address: String;
  totalRep: BigNumber;
  ethBalance: BigNumber;
  userEthBalance: BigNumber;
  blockNumber: Number;
  userRep: BigNumber;
  userVotingMachineTokenBalance: BigNumber;
  userVotingMachineTokenApproved: BigNumber;
}
