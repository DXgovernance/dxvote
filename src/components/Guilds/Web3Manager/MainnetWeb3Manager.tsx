import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useRpcUrls } from '../../../provider/providerHooks';
import { DEFAULT_ETH_CHAIN_ID, getNetworkConnector } from '../../../provider/connectors';

export const MAINNET_WEB3_ROOT_KEY = 'MAINNET';

const MainnetWeb3Manager = ({ children }) => {
  const { activate, active, error } = useWeb3React(MAINNET_WEB3_ROOT_KEY);
  const rpcUrls = useRpcUrls();

  // Connect to mainnet
  useEffect(() => {
    if (!rpcUrls) return;

    const networkConnector = getNetworkConnector(rpcUrls, DEFAULT_ETH_CHAIN_ID);
    activate(networkConnector, undefined, true).catch(e => {
      console.error(
        '[MainnetWeb3Manager] Unable to activate network connector.',
        e
      );
    });
  }, [rpcUrls, activate]);

  if (error) {
    console.debug('[MainnetWeb3Manager] Render: Network error.');
    return null;
  } else if (!active) {
    return null;
  } else {
    return children;
  }
};

export default MainnetWeb3Manager;
