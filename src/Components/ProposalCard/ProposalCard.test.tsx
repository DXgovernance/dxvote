import ProposalCard from 'Components/ProposalCard/ProposalCard';
import { render } from '../../utils/tests';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import { proposalMock, proposalStatusPropsMock } from '../Fixtures';

jest.mock('ipfs', () => jest.fn());
jest.mock('cids', () => jest.fn());
jest.mock('axios', () => jest.fn());
jest.mock('hooks/Guilds/guild/useProposalSummaryActions', () => {
  return {
    useProposalSummaryActions: jest.fn(),
  };
});
jest.mock('contexts/index', () => jest.fn());
jest.mock('hooks/Guilds/ether-swr/ens/useENS', () => ({
  __esModule: true,
  default: () => ({
    address: 'test',
    name: 'test.eth',
  }),
}));
jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

const validProps: ProposalCardProps = {
  proposal: proposalMock,
  votes: [10, 20],
  href: 'testUrl',
  statusProps: proposalStatusPropsMock,
  summaryActions: [],
};

const invalidProps: ProposalCardProps = {
  proposal: null,
  votes: [],
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
