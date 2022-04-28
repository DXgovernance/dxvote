import { render } from '../../../../../utils/tests';
import { ProposalOptionTag } from './ProposalOptionTag';

describe('ProposalOptionTag', () => {
  it('Should match snapshot', () => {
    const { container } = render(
      <ProposalOptionTag option={{ id: '1', color: 'blue', label: 'For' }} />
    );
    expect(container).toMatchSnapshot();
  });
});
