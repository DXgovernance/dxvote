import ProposalCardVotes from './ProposalCardVotes';
import { render } from '../../utils/tests';
import '@testing-library/jest-dom';

test.skip('ProposalCard votes', async () => {
  const { container } = render(
    <ProposalCardVotes isLoading={false} votes={[10, 20]} />
  );

  expect(container).toMatchSnapshot();
});

test.skip('ProposalCard votes loading', async () => {
  const { container } = render(
    <ProposalCardVotes isLoading={true} votes={null} />
  );

  expect(container).toMatchSnapshot();
});
