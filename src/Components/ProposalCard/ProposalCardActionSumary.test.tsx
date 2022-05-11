import ProposalCardVotes from './ProposalCardVotes';
import { render } from '../../utils/tests';

jest.mock('hooks/Guilds/guild/useFilteredProposalActions', () => ({
  actions: [],
}));

test('ProposalCard votes', async () => {
  const { container } = render(
    <ProposalCardVotes isLoading={false} votes={[10, 20]} />
  );

  expect(container).toMatchSnapshot();
});

test('ProposalCard votes loading', async () => {
  const { container } = render(
    <ProposalCardVotes isLoading={true} votes={null} />
  );

  expect(container).toMatchSnapshot();
});
