import ProposalCard from 'Components/ProposalCard/ProposalCard';
import { render } from '../../utils/tests';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import moment from 'moment';
import { ProposalState } from 'Components/Types';

jest.mock('ipfs', () => jest.fn());
jest.mock('cids', () => jest.fn());
jest.mock('axios', () => jest.fn());
jest.mock('hooks/Guilds/guild/useProposalSummaryActions', () => {
  return {
    useProposalSummaryActions: jest.fn(),
  };
});
jest.mock('contexts/index', () => jest.fn());

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
    endTime: moment('2022-05-09T08:00:00'),
  },
  summaryActions: [],
};

const invalidProps: ProposalCardProps = {
  proposal: null,
  votes: [],
  ensAvatar: null,
  href: null,
  statusProps: {
    timeDetail: null,
    status: null,
    endTime: null,
  },
  summaryActions: [],
};
describe('ProposalCard', () => {
  it('ProposalCard Renders properly with data', () => {
    const { container } = render(<ProposalCard {...validProps} />);
    expect(container).toMatchSnapshot();
  });
  it('ProposalCard loading', () => {
    const { container } = render(<ProposalCard {...invalidProps} />);
    expect(container).toMatchSnapshot();
  });
});
