import { ChainConfig } from '../types/types';

export const MAX_UINT =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ANY_ADDRESS = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa';
export const ANY_FUNC_SIGNATURE = '0xaaaaaaaa';
export const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';
export const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';
export const DEFAULT_TOKEN_DECIMALS = 18;

export const MAX_BLOCKS_PER_EVENTS_FETCH: number = 1000000;

const defaultAlchemyKey = '7i7fiiOx1b7bGmgWY_oI9twyQBCsuXKC';

export const DISCOURSE_URL_ROOT = 'https://daotalk.org';

export const MAINNET_ID = 1;
export const LOCALHOST_ID = 1337;

export const DEFAULT_CHAIN_ID =
  process.env.NODE_ENV === 'development' ? LOCALHOST_ID : MAINNET_ID;

export const POKT_NETWORK_URLS = {
  '1': 'https://eth-archival.gateway.pokt.network/v1/lb/61f86d630d66d80038fb8c38',
  '5': 'https://eth-goerli.gateway.pokt.network/v1/lb/61116c81a585a20035149067',
  '100':
    'https://poa-xdai-archival.gateway.pokt.network/v1/lb/61d897d4a065f5003a113d9a',
};

export const NETWORKS: ChainConfig[] = [
  {
    id: 1,
    name: 'mainnet',
    displayName: 'Ethereum Mainnet',
    defaultRpc: `https://eth-mainnet.alchemyapi.io/v2/${defaultAlchemyKey}`,
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://etherscan.io',
    api: 'https://api.etherscan.io',
  },
  {
    id: 5,
    name: 'goerli',
    displayName: 'Goerli Testnet',
    defaultRpc: POKT_NETWORK_URLS['5'],
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://goerli.etherscan.io/',
    api: 'https://api-goerli.etherscan.io/',
  },
  {
    id: 100,
    name: 'xdai',
    displayName: 'Gnosis Chain',
    defaultRpc: POKT_NETWORK_URLS['100'],
    nativeAsset: {
      name: 'xDai',
      symbol: 'xDAI',
      decimals: 18,
    },
    blockExplorer: 'https://blockscout.com/xdai/mainnet/',
    api: 'https://blockscout.com/xdai/mainnet/api',
  },
  {
    id: 42161,
    name: 'arbitrum',
    displayName: 'Arbitrum One',
    defaultRpc: `https://arb-mainnet.g.alchemy.com/v2/${defaultAlchemyKey}`,
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://arbiscan.io/',
    api: 'https://api.arbiscan.io/',
  },
  {
    id: 421611,
    name: 'arbitrumTestnet',
    displayName: 'Arbitrum Testnet',
    defaultRpc: `https://arb-rinkeby.g.alchemy.com/v2/${defaultAlchemyKey}`,
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://rinkeby-explorer.arbitrum.io/',
  },
  {
    id: 421613,
    name: 'arbitrumNitroTestnet',
    displayName: 'Arbitrum Nitro Testnet',
    defaultRpc: `https://goerli-rollup.arbitrum.io/rpc`,
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: 'https://goerli-rollup-explorer.arbitrum.io/',
  },
];

if (process.env.NODE_ENV === 'development')
  NETWORKS.push({
    id: 1337,
    name: 'localhost',
    displayName: 'Localhost',
    defaultRpc: `http://127.0.0.1:8545`,
    nativeAsset: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  });

export const NETWORK_NAMES: Record<ChainConfig['id'], ChainConfig['name']> =
  NETWORKS.reduce((acc, network) => {
    acc[network.id] = network.name;
    return acc;
  }, {});

export const getNetworkByName = function (networkName: string): ChainConfig {
  return NETWORKS.find(network => network.name == networkName);
};

export const getNetworkById = function (networkId: number): ChainConfig {
  return NETWORKS.find(network => network.id == networkId);
};

export const NETWORK_DISPLAY_NAMES: Record<
  ChainConfig['id'],
  ChainConfig['displayName']
> = NETWORKS.reduce((acc, network) => {
  acc[network.id] = network.displayName;
  return acc;
}, {});

export const DEFAULT_RPC_URLS: Record<
  ChainConfig['id'],
  ChainConfig['defaultRpc']
> = NETWORKS.reduce((acc, network) => {
  acc[network.id] = network.defaultRpc;
  return acc;
}, {});

export const NETWORK_EXPLORERS: { [name: string]: string } = NETWORKS.reduce(
  (acc, network) => {
    if (network?.blockExplorer) {
      acc[network.name] = network.blockExplorer;
    }
    return acc;
  },
  {}
);

export const NETWORK_ASSET_SYMBOL: Record<
  ChainConfig['name'],
  ChainConfig['nativeAsset']['symbol']
> = NETWORKS.reduce((acc, network) => {
  acc[network.name] = network.nativeAsset.symbol;
  return acc;
}, {});

export const INFURA_NETWORK_NAMES = {
  '1': 'mainnet',
  '42161': 'arbitrum-mainnet',
  '421611': 'arbitrum-rinkeby',
};

export const ALCHEMY_NETWORK_URLS = {
  '1': 'eth-mainnet.alchemyapi.io',
  '42161': 'arb-mainnet.g.alchemy.com',
  '421611': 'arb-rinkeby.g.alchemy.com',
};

export const NETWORK_APIS: { [name: string]: string } = NETWORKS.reduce(
  (acc, network) => {
    if (network?.blockExplorer) {
      acc[network.name] = network.api;
    }
    return acc;
  },
  {}
);
