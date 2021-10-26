import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  DEFAULT_ETH_CHAIN_ID,
  getChains,
  getNetworkConnector,
} from 'provider/connectors';
import { useEagerConnect, useRpcUrls } from 'provider/providerHooks';
import { useContext } from 'contexts';
import { useInterval, usePrevious } from 'utils';

const BLOKCHAIN_FETCH_INTERVAL = 10000;

const Web3ReactManager = ({ children }) => {
  const { context } = useContext();
  const { providerStore, blockchainStore, userStore } = context;

  const location = useLocation();
  const rpcUrls = useRpcUrls();

  const web3Context = useWeb3React();
  const {
    active: networkActive,
    error: networkError,
    chainId,
    account,
    activate,
  } = web3Context;

  console.debug('[Web3ReactManager] Start of render', {
    web3Context,
  });

  // Make sure providerStore is synchronized with web3-react
  useEffect(() => {
    providerStore.setWeb3Context(web3Context);
  }, [web3Context]);

  // try to eagerly connect to a provider if possible
  const triedEager = useEagerConnect();

  // If eager-connect failed, try to connect to network in the URL
  // If no chain in the URL, fallback to default chain
  useEffect(() => {
    if (triedEager && !networkActive && rpcUrls) {
      const chains = getChains(rpcUrls);
      const urlNetworkName = location.pathname.split('/')[1];
      const chainId =
        chains.find(chain => chain.name == urlNetworkName)?.id ||
        DEFAULT_ETH_CHAIN_ID;
      const networkConnector = getNetworkConnector(rpcUrls, chainId);

      activate(networkConnector, undefined, true).catch(e => {
        console.error(
          '[Web3ReactManager] Unable to activate network connector.',
          e
        );
      });
    }
  }, [triedEager, networkActive, activate, rpcUrls]);

  const prevChainId = usePrevious(chainId);
  const prevAccount = usePrevious(account);
  useEffect(() => {
    // Listen to chain / account changes and reset the app
    if (
      (prevChainId !== chainId) ||
      (prevAccount !== account)
    ) {
      try {
        context.reset();
        blockchainStore.fetchData(providerStore.getActiveWeb3React(), false);
      } catch (e) {
        // Fallback if something goes wrong
        window.location.reload();
      }
    }
  }, [chainId, prevChainId, account, prevAccount]);

  // Fetch user blockchain data on an interval using current params
  useInterval(
    async () => {
      if (networkActive) {
        userStore.update(providerStore.getActiveWeb3React());
        blockchainStore.fetchData(providerStore.getActiveWeb3React(), false);
      }
    },
    networkActive ? BLOKCHAIN_FETCH_INTERVAL : 10
  );

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    console.debug('[Web3ReactManager] Render: Eager load not tried');
    return null;
  }
  if (networkError) {
    console.debug(
      '[Web3ReactManager] Render: Network error, showing modal error.'
    );
    return null;
  } else {
    console.debug(
      '[Web3ReactManager] Render: Active network, render children',
      { networkActive }
    );
    return children;
  }
};

export default Web3ReactManager;
