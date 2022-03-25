import { Moment } from 'moment';
import {
  BigNumber,
} from './utils';
export interface Proposal {
  id: string;
  creator: string;
  startTime: Moment;
  endTime: Moment;
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
  Active = "Active",
  Passed = "Passed",
  Executed = "Executed",
  Failed = "Failed",
}
export interface ProposalMetadata {
  description: string;
}
export interface Transaction {
  hash: string
  from: string
  summary?: string
  receipt?: {
    transactionHash: string,
    blockNumber: number,
    status: number,
  }
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
}

export enum GuildImplementationType {
  SnapshotRepERC20Guild = 'SnapshotRepERC20Guild',
  DXDGuild = 'DXDGuild',
  ERC20Guild = 'ERC20Guild',
  IERC20Guild = 'IERC20Guild',
}