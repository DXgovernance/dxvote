import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const INFURA_API_KEY = process.env.REACT_APP_KEY_INFURA_API_KEY;
export const ETH_NETWORKS = process.env.REACT_APP_ETH_NETWORKS.split(',');

export const CHAIN_NAME_BY_ID = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '42': 'kovan',
  '1337': 'localhost',
};

export const CHAIN_ID_BY_NAME = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42,
  'localhost': 1337,
};

export const DEFAULT_ETH_NETWORK = ETH_NETWORKS[0];
export const DEFAULT_ETH_CHAIN_ID = CHAIN_ID_BY_NAME[ETH_NETWORKS[0]];

export const RPC_URLS = {
  '1': process.env.REACT_APP_SUPPORTED_NETWORK_1 || 'https://mainnet.infura.io/v3/'+INFURA_API_KEY,
  '3': process.env.REACT_APP_SUPPORTED_NETWORK_3 || 'https://ropsten.infura.io/v3/'+INFURA_API_KEY,
  '4': process.env.REACT_APP_SUPPORTED_NETWORK_4 || 'https://rinkeby.infura.io/v3/'+INFURA_API_KEY,
  '42': process.env.REACT_APP_SUPPORTED_NETWORK_42 || 'https://kovan.infura.io/v3/'+INFURA_API_KEY,
  '66': process.env.REACT_APP_SUPPORTED_NETWORK_66 || 'http://localhost:8545/',
};

export const web3ContextNames = {
  injected: 'INJECTED',
  metamask: 'METAMASK',
  walletconnect: 'WALLETCONNECT',
};

const POLLING_INTERVAL = 5000;

export const supportedChains = ETH_NETWORKS;
export const defaultChainId = CHAIN_ID_BY_NAME[ETH_NETWORKS[0]];
let supportedChainIds = [];
supportedChains.forEach((network) => supportedChainIds.push(CHAIN_ID_BY_NAME[network]));


export const isChainIdSupported = (chainId: number): boolean => {
    return supportedChains.indexOf(CHAIN_NAME_BY_ID[chainId]) >= 0;
};

export const injected = new InjectedConnector({
    supportedChainIds: supportedChainIds,
});

export const walletconnect = new WalletConnectConnector({
  rpc: { 
    [defaultChainId] : RPC_URLS[defaultChainId],
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: false,
  pollingInterval: POLLING_INTERVAL,
})

export default {
    injected,
    walletconnect
};

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
    },
    WALLETCONNECT: {
        connector: walletconnect,
        name: 'WalletConnect',
        iconName: require('assets/images/walletConnectIcon.svg'),
        description: 'Connect form mobile.',
        href: null,
        color: '#E8831D',
    },
};
