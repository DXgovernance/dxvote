import ProposalCardActionSummary from './ProposalCardActionSummary';
import { render } from '../../utils/tests';

jest.mock('ipfs', () => jest.fn());
jest.mock('cids', () => jest.fn());
jest.mock('axios', () => jest.fn());
jest.mock('hooks/Guilds/guild/useProposalSummaryActions', () => {
  return {
    useProposalSummaryActions: jest.fn(),
  };
});
jest.mock('contexts/index', () => jest.fn());

describe('ProposalCardActionSummary', () => {
  it('Should match snapshot without proposal', async () => {
    const { container } = render(<ProposalCardActionSummary actions={[]} />);
    expect(container).toMatchSnapshot();
  });
});
