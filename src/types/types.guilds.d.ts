import {
  BigNumber,
} from './utils';

export interface Proposal {
  id: string;
  creator: string;
  startTime: BigNumber;
  endTime: BigNumber;
  to: string[];
  data: string[];
  value: BigNumber[];
  totalActions: BigNumber;
  title: string;
  contentHash: string;
  state: ProposalState;
  totalVotes: BigNumber[];
}

export enum ProposalState {
  None, Submitted, Rejected, Executed, Failed
}
export interface ProposalMetadata {
  description: string;
}
export interface Transaction {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: TransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}