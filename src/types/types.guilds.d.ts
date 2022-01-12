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