import Header from './Header';
import { render } from 'utils/tests';

jest.mock('contexts/index', () => jest.fn());

describe('Header', () => {
  it('Should match snapshot', () => {
    const { container } = render(<Header />);
    expect(container).toMatchSnapshot();
  });
});
