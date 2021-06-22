import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const ETH_NETWORKS = process.env.REACT_APP_ETH_NETWORKS.split(',');

export const NETWORK_NAMES = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '42': 'kovan',
  '100': 'xdai',
  '42161': 'arbitrum',
  '421611': 'arbitrumTestnet',
  '1337': 'localhost',
};

export const NETWORK_IDS = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42,
  'xdai': 100,
  'arbitrum': 42161,
  'arbitrumTestnet': 421611,
  'localhost': 1337,
};

export const ETH_NETWORKS_IDS = ETH_NETWORKS.map((network) => {return NETWORK_IDS[network]});
export const DEFAULT_ETH_CHAIN_ID = NETWORK_IDS[ETH_NETWORKS[0]];

export const web3ContextNames = {
  injected: 'INJECTED',
  metamask: 'METAMASK',
};

export const isChainIdSupported = (chainId: number): boolean => {
  return ETH_NETWORKS_IDS ? ETH_NETWORKS_IDS.indexOf(chainId) >= 0 : false;
};

export const injected = new InjectedConnector({
  supportedChainIds: ETH_NETWORKS_IDS,
});

export const SUPPORTED_WALLETS = {
    INJECTED: {
        connector: injected,
        name: 'Injected',
        iconName: 'arrow-right.svg',
        description: 'Injected web3 provider.',
        href: null,
        color: '#010101',
        primary: true,
    },
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconName: require('assets/images/metamask.png'),
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    }
};

export default {
  injected
};
