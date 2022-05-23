import '@testing-library/jest-dom';
import AddressButton from './AddressButton';
import { render } from '../../utils/tests';
import { fullProps, partialProps } from './fixtures';

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

fullProps.onClick = jest.fn();

describe('AddressButton', () => {
  it('Should render properly with full props', async () => {
    const { container } = render(<AddressButton {...fullProps} />);
    expect(container).toMatchSnapshot();
  });
  it('Should render properly with partial props', async () => {
    const { container } = render(<AddressButton {...partialProps} />);
    expect(container).toMatchSnapshot();
  });
});
