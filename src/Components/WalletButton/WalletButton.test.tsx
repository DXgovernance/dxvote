import WalletButton from './WalletButton';
import { render } from 'utils/tests';
import { useWeb3React } from '@web3-react/core';
import { ANY_ADDRESS, shortenAddress } from 'utils';

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

jest.mock('contexts/index', () => jest.fn());
jest.mock('contexts/Guilds', () => {
  return {
    useTransactions: () => {
      return [];
    },
  };
});

jest.mock('provider/providerHooks', () => {
  return {
    useRpcUrls: () => {
      return {
        '1': 'https://mainnet.infura.io/v3/dummy',
      };
    },
  };
});

jest.mock('@web3-react/core', () => ({
  useWeb3React: jest.fn(),
}));

const mockedUseWeb3React = useWeb3React as jest.Mock;

describe('WalletButton', () => {
  it('Should match snapshot and display connect wallet', () => {
    mockedUseWeb3React.mockImplementation(() => ({
      account: null,
      chainId: null,
    }));
    const { container, getByText } = render(<WalletButton />);
    expect(container).toMatchSnapshot();
    expect(getByText('connectWallet')).toBeInTheDocument();
  });
  it('Should match snapshot and display connected address', () => {
    mockedUseWeb3React.mockImplementation(() => ({
      account: ANY_ADDRESS,
      chainId: 1,
    }));
    const { container, getByText } = render(<WalletButton />);
    expect(container).toMatchSnapshot();
    expect(getByText(shortenAddress(ANY_ADDRESS))).toBeInTheDocument();
  });
});
