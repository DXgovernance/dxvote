import { render } from '../../../../utils/tests';
import { ProposalActionTag, ActionTypes } from './ProposalActionTag';

describe('ProposalActionTag', () => {
  it('Should match snapshot', () => {
    const { container } = render(<ProposalActionTag type={ActionTypes.for} />);
    expect(container).toMatchSnapshot();
  });
});
