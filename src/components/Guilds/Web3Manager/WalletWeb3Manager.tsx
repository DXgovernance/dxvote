import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  DEFAULT_ETH_CHAIN_ID,
  getChains,
  getNetworkConnector,
} from 'provider/connectors';
import { useEagerConnect, useRpcUrls } from 'provider/providerHooks';
import { NetworkConnector } from '@web3-react/network-connector';

const WalletWeb3Manager = ({ children }) => {
  const location = useLocation();
  const rpcUrls = useRpcUrls();

  // Overriding default fetch to check for RPC url and setting correct headers if matched
  const originalFetch = window.fetch;
  window.fetch = (url, opts): Promise<Response> => {
    if (rpcUrls && Object.values(rpcUrls).includes(url) && opts) {
      opts.headers = opts.headers || {
        'Content-Type': 'application/json',
      };
    }
    return originalFetch(url, opts);
  };

  const {
    active: networkActive,
    error: networkError,
    connector,
    activate,
  } = useWeb3React();

  // try to eagerly connect to a provider if possible
  const { triedEager, tryConnecting } = useEagerConnect();

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
  }, [triedEager, networkActive, activate, rpcUrls, location]);

  // Setup listener to handle injected wallet events
  useEffect(() => {
    if (!window.ethereum) return () => {};

    const handleChainChange = (chainId: string) => {
      const chains = getChains();
      const chain = chains.find(
        chain => `0x${chain.id.toString(16)}` == chainId
      );

      // If currently connected to an injected wallet, keep synced with it
      if (connector instanceof NetworkConnector) {
        const urlNetworkName = location.pathname.split('/')[1];
        if (urlNetworkName === chain.name) {
          tryConnecting();
        }
      }
    };

    window.ethereum.on('chainChanged', handleChainChange);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleChainChange);
    };
  }, [location, connector, tryConnecting]);

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

export default WalletWeb3Manager;
