import NetworkButton from './NetworkButton';
import { render } from 'utils/tests';
import { useWeb3React } from '@web3-react/core';

jest.mock('contexts/index', () => jest.fn());
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

describe('NetworkButton', () => {
  it('Should match snapshot and display not connected status', () => {
    mockedUseWeb3React.mockImplementation(() => ({
      active: false,
      chainId: null,
    }));
    const { container, getByText } = render(<NetworkButton />);
    expect(container).toMatchSnapshot();
    expect(getByText('notConnected')).toBeInTheDocument();
  });
  it('Should match snapshot and display network', () => {
    mockedUseWeb3React.mockImplementation(() => ({
      active: true,
      chainId: 1,
    }));
    const { container, getByText } = render(<NetworkButton />);
    expect(container).toMatchSnapshot();
    expect(getByText('Ethereum Mainnet')).toBeInTheDocument();
  });
});
