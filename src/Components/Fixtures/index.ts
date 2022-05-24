import { BigNumber } from 'ethers';
import moment from 'moment';
import { Proposal, ProposalState } from '../Types';

export const proposalMock: Proposal = {
  id: '0x1234567890123456789012345678901234567890',
  title: 'SWPR single reward campaign',
  contentHash: '0x1234567890123456789012345678901234567890',
  creator: '0x1234567890123456789012345678901234567890',
  data: [],
  to: [],
  value: [],
  startTime: moment(),
  endTime: moment(),
  state: ProposalState.Active,
  totalActions: BigNumber.from(0),
  totalVotes: [],
};

export const proposalStatusPropsMock = {
  timeDetail: 'Time',
  status: ProposalState.Active,
  endTime: moment('2022-05-09T08:00:00'),
};
