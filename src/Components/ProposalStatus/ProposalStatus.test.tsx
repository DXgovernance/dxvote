import ProposalStatus from './ProposalStatus';
import { render } from '../../utils/tests';
import { ProposalStatusProps } from './types';
import { ProposalState } from 'Components/Types';
import moment from 'moment';

const validProps: ProposalStatusProps = {
  timeDetail: 'Time',
  status: ProposalState.Active,
  endTime: moment('2022-05-09T08:00:00'),
};

const invalidProps: ProposalStatusProps = {
  timeDetail: null,
  status: null,
  endTime: null,
};

test('ProposalStatus votes', async () => {
  const { container } = render(<ProposalStatus {...validProps} />);

  expect(container).toMatchSnapshot();
});

test('ProposalStatus loading', async () => {
  const { container } = render(<ProposalStatus {...invalidProps} />);

  expect(container).toMatchSnapshot();
});
