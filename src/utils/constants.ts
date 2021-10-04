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

export const NETWORK_NAMES = {
  '1': 'mainnet',
  '4': 'rinkeby',
  '100': 'xdai',
  '42161': 'arbitrum',
  '421611': 'arbitrumTestnet',
  '1337': 'localhost',
};

const defaultInfuraKey = process.env.REACT_APP_KEY_INFURA_API_KEY;
export const DEFAULT_RPC_URLS = {
  '1': `https://mainnet.infura.io/v3/${defaultInfuraKey}`,
  '4': `https://rinkeby.infura.io/v3/${defaultInfuraKey}`,
  '100': 'https://rpc.xdaichain.com/',
  '42161': `https://arbitrum-mainnet.infura.io/v3/${defaultInfuraKey}`,
  '421611': `https://arbitrum-rinkeby.infura.io/v3/${defaultInfuraKey}`,
};

export const INFURA_NETWORK_NAMES = {
  '1': 'mainnet',
  '4': 'rinkeby',
  '42161': 'arbitrum-mainnet',
  '421611': 'arbitrum-rinkeby',
};

export const ALCHEMY_NETWORK_URLS = {
  '1': 'eth-mainnet.alchemyapi.io',
  '4': 'eth-rinkeby.alchemyapi.io',
  '42161': 'arb-mainnet.g.alchemy.com',
  '421611': 'arb-rinkeby.g.alchemy.com',
};

export const NETWORK_IDS = {
  mainnet: 1,
  rinkeby: 4,
  xdai: 100,
  arbitrum: 42161,
  arbitrumTestnet: 421611,
  localhost: 1337,
};

export const NETWORK_ASSET_SYMBOL = {
  mainnet: 'ETH',
  rinkeby: 'ETH',
  xdai: 'XDAI',
  arbitrum: 'ETH',
  arbitrumTestnet: 'ETH',
  localhost: 'ETH',
};
