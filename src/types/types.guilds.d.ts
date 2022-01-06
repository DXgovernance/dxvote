import {
  BigNumber,
} from './utils';

export interface Proposal {
    creator: string;
    startTime: BigNumber;
    endTime: BigNumber;
    to: string[];
    data: string[];
    value: BigNumber[];
    totalActions: BigNumber;
    title: string;
    contentHash: string;
    state: number;
    totalVotes: BigNumber[];
  }