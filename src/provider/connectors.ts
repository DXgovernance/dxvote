import { InjectedConnector } from '@web3-react/injected-connector'
import { NETWORK_IDS } from '../utils';

export const ETH_NETWORKS = process.env.REACT_APP_ETH_NETWORKS.split(',');
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
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D',
    }
};

export default {
  injected
};
