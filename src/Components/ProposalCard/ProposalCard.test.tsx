import ProposalCard from 'Components/ProposalCard/ProposalCard';
import { render } from '../../utils/tests';
import { ProposalCardProps } from 'Components/ProposalCard/types';
import {
  ensAvatarMock,
  proposalMock,
  proposalStatusPropsMock,
} from '../Fixtures';

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
  proposal: proposalMock,
  votes: [10, 20],
  ensAvatar: ensAvatarMock,
  href: 'testUrl',
  statusProps: proposalStatusPropsMock,
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
