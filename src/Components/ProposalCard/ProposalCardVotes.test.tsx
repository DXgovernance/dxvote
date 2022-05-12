import ProposalCardVotes from './ProposalCardVotes';
import { render } from '../../utils/tests';

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
