import '@testing-library/jest-dom';
import AddressButton from './AddressButton';
import { AddressButtonProps } from 'Components/AddressButton/types';
import { render } from '../../utils/tests';

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

const fullProps: AddressButtonProps = {
  address: '0x79706C8e413CDaeE9E63f282507287b9Ea9C0928',
  transactionsCounter: 0,
  onClick: jest.fn(),
};

const partialProps: AddressButtonProps = {
  address: '0x79706C8e413CDaeE9E63f282507287b9Ea9C0928',
};

test('AddressButton renders properly with full props', async () => {
  const { container } = render(<AddressButton {...fullProps} />);
  expect(container).toMatchSnapshot();
});

test('AddressButton renders properly with partial props', async () => {
  const { container } = render(<AddressButton {...partialProps} />);
  expect(container).toMatchSnapshot();
});
