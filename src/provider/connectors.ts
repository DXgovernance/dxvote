import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { NETWORK_IDS } from '../utils';
import metamaskIcon from '../assets/images/metamask.png';
import walletConnectIcon from '../assets/images/walletconnect.png';

export const ETH_NETWORKS = process.env.REACT_APP_ETH_NETWORKS.split(',');
export const ETH_NETWORKS_IDS = ETH_NETWORKS.map(network => {
  return NETWORK_IDS[network];
});
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

export function getWalletConnectConnector(customRpcUrls: {
  [chainId: number]: string;
}) {
  return new WalletConnectConnector({
    rpc: customRpcUrls,
    qrcode: true,
  });
}

export function getNetworkConnector(customRpcUrls: {
  [chainId: number]: string;
}) {
  return new NetworkConnector({
    urls: customRpcUrls,
    defaultChainId: DEFAULT_ETH_CHAIN_ID,
  });
}

export const getWallets = (customRpcUrls: { [chainId: number]: string }) => ({
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
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    icon: metamaskIcon,
  },
  WALLETCONNECT: {
    connector: getWalletConnectConnector(customRpcUrls),
    name: 'WalletConnect',
    description: 'Open protocol for connecting Wallets to Dapps.',
    href: null,
    color: '#E8831D',
    icon: walletConnectIcon,
  },
});
