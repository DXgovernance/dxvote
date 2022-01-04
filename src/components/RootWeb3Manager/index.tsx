import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useContext } from '../../contexts';
import { useRpcUrls } from '../../provider/providerHooks';
import { getNetworkConnector } from '../../provider/connectors';

export const MAINNET_WEB3_ROOT_KEY = 'MAINNET';
export const RINKEBY_WEB3_ROOT_KEY = 'RINKEBY';

const RootWeb3Provider = ({ children }) => {
  const mainnetWeb3Context = useWeb3React(MAINNET_WEB3_ROOT_KEY);
  const rinkebyWeb3Context = useWeb3React(RINKEBY_WEB3_ROOT_KEY);
  const { context } = useContext();
  const rpcUrls = useRpcUrls();
  const { ensService, messageLoggerService } = context;

  // Connect to mainnet
  useEffect(() => {
    if (!rpcUrls) return;

    const mainnetNetworkConnector = getNetworkConnector(rpcUrls, 1);
    const rinkebyNetworkConnector = getNetworkConnector(rpcUrls, 4);
    mainnetWeb3Context
      .activate(mainnetNetworkConnector, undefined, true)
      .catch(e => {
        console.error(
          '[RootWeb3Provider] Unable to activate mainnet network connector.',
          e
        );
      });
    rinkebyWeb3Context
      .activate(rinkebyNetworkConnector, undefined, true)
      .catch(e => {
        console.error(
          '[RootWeb3Provider] Unable to activate rinkeby network connector.',
          e
        );
      });
  }, [rpcUrls]);

  // Make sure ensService is synchronized with web3-react
  useEffect(() => {
    ensService.setENSWeb3Context(mainnetWeb3Context);
    messageLoggerService.setRinkebyWeb3Context(rinkebyWeb3Context);
  }, [mainnetWeb3Context, rinkebyWeb3Context]);

  if (mainnetWeb3Context.error) {
    console.debug('[RootWeb3Provider] Render: mainnet network error.');
    return null;
  } else if (!mainnetWeb3Context.active) {
    return null;
  } else if (rinkebyWeb3Context.error) {
    console.debug('[RootWeb3Provider] Render: rinkeby network error.');
    return null;
  } else if (!rinkebyWeb3Context.active) {
    return null;
  } else {
    return children;
  }
};

export default RootWeb3Provider;
