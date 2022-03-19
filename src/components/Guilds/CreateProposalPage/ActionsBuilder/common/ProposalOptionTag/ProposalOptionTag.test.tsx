import { render } from '../../../../../../utils/tests';
import { ProposalOptionTag } from './ProposalOptionTag';

describe('ProposalOptionTag', () => {
  it('Should match snapshot', () => {
    const { container } = render(
      <ProposalOptionTag option={{ index: 0, label: 'For' }} />
    );
    expect(container).toMatchSnapshot();
  });
});
