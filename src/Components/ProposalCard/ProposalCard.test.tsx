import ProposalCard from './ProposalCard';
import { render } from '../../utils/tests';
import '@testing-library/jest-dom';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import moment from 'moment';
import { ProposalState } from 'Components/Types';

const validProps: ProposalCardProps = {
  proposal: {
    id: '42',
    creator: '0x0b17cf48420400e1d71f8231d4a8e43b3566bb5b',
    startTime: moment(),
    endTime: moment(),
    to: [''],
    data: [''],
    value: [],
    totalActions: null,
    title: 'test',
    contentHash: '0x0',
    state: ProposalState.Active,
    totalVotes: [],
  },
  votes: [10, 20],
  ensAvatar: { ensName: 'rossdev.eth', imageUrl: '' },
  href: 'testUrl',
  statusProps: {
    timeDetail: 'Time',
    status: ProposalState.Active,
  },
};

const invalidProps: ProposalCardProps = {
  proposal: null,
  votes: [],
  ensAvatar: null,
  href: null,
  statusProps: {
    timeDetail: null,
    status: null,
  },
};

test('ProposalCard Renders properly with data', async () => {
  const { container } = render(<ProposalCard {...validProps} />);

  expect(container).toMatchSnapshot();
});

test('ProposalCard loading', async () => {
  const { container } = render(<ProposalCard {...invalidProps} />);

  expect(container).toMatchSnapshot();
});
