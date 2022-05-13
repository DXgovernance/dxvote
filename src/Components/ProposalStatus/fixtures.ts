import { ProposalState } from 'Components/Types';
import moment from 'moment';
import { ProposalStatusProps } from './types';

export const proposalStatusMock: ProposalStatusProps = {
  endTime: moment(),
  status: ProposalState.Active,
  timeDetail: '1 minute ago',
};
