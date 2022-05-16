import { useWeb3React } from '@web3-react/core';
import { getNetworkById } from 'utils';

const configs = {
  arbitrum: require('configs/arbitrum/config.json'),
  arbitrumTestnet: require('configs/arbitrumTestnet/config.json'),
  mainnet: require('configs/mainnet/config.json'),
  xdai: require('configs/xdai/config.json'),
  rinkeby: require('configs/rinkeby/config.json'),
  localhost: require('configs/localhost/config.json'),
};

const useNetworkConfig = (chain?: number): NetworkConfig => {
  const { chainId } = useWeb3React();
  const { name } = getNetworkById(chain || chainId);
  return configs[name];
};

export default useNetworkConfig;
