import ProposalCardVotes from './ProposalCardVotes';
import { render } from '../../utils/tests';

describe('ProposalCardVotes.test', () => {
  it('Should match snapshot with votes', async () => {
    const { container } = render(
      <ProposalCardVotes isLoading={false} votes={[10, 20]} />
    );

    expect(container).toMatchSnapshot();
  });

  it('Should match snapshot without votes', async () => {
    const { container } = render(
      <ProposalCardVotes isLoading={true} votes={null} />
    );

    expect(container).toMatchSnapshot();
  });
});
