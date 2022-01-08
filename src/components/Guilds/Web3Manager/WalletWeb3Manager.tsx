import { useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import {
  DEFAULT_ETH_CHAIN_ID,
  getChains,
  getNetworkConnector,
} from 'provider/connectors';
import { useEagerConnect, useRpcUrls } from 'provider/providerHooks';
import { NetworkConnector } from '@web3-react/network-connector';
// import { useGuildConfigContext } from '../../../contexts/Guilds';

const WalletWeb3Manager = ({ children }) => {
  const history = useHistory();
  const routeMatch = useRouteMatch<{ chain_name?: string }>('/:chain_name');
  // const guildConfigContext = useGuildConfigContext();
  const urlNetworkName = routeMatch?.params?.chain_name;

  const rpcUrls = useRpcUrls();
  const chains = getChains(rpcUrls);

  // Overriding default fetch to check for RPC url and setting correct headers if matched
  const originalFetch = window.fetch;
  window.fetch = (url, opts): Promise<Response> => {
    if (rpcUrls && Object.values(rpcUrls).includes(url.toString()) && opts) {
      opts.headers = opts.headers || {
        'Content-Type': 'application/json',
      };
    }
    return originalFetch(url, opts);
  };
  const web3Context = useWeb3React();
  const {
    active: networkActive,
    error: networkError,
    connector,
    activate,
    chainId,
  } = web3Context;

  // try to eagerly connect to a provider if possible
  const { triedEager, tryConnecting } = useEagerConnect();

  // If eager-connect failed, try to connect to network in the URL
  // If no chain in the URL, fallback to default chain
  useEffect(() => {
    if (triedEager && !networkActive && rpcUrls) {
      const chainId =
        chains.find(chain => chain.name === urlNetworkName)?.id ||
        DEFAULT_ETH_CHAIN_ID;
      const networkConnector = getNetworkConnector(rpcUrls, chainId);

      activate(networkConnector, undefined, true).catch(e => {
        console.error(
          '[Web3ReactManager] Unable to activate network connector.',
          e
        );
      });
    }
  }, [triedEager, networkActive, activate, rpcUrls, chains, urlNetworkName]);

  // Setup listener to handle injected wallet events
  useEffect(() => {
    if (!window.ethereum) return () => {};

    const handleChainChange = (chainId: string) => {
      const chain = chains.find(
        chain => `0x${chain.id.toString(16)}` == chainId
      );

      // If currently connected to an injected wallet, keep synced with it
      if (connector instanceof NetworkConnector) {
        if (urlNetworkName === chain.name) {
          tryConnecting();
        }
      }
    };

    window.ethereum.on('chainChanged', handleChainChange);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleChainChange);
    };
  }, [urlNetworkName, connector, tryConnecting, chains]);

  // Update the URL when the network changes
  useEffect(() => {
    const currentChain = chains.find(chain => chain.id === chainId)?.name;
    if (currentChain && currentChain !== urlNetworkName) {
      history.push(`/${currentChain}`);
    }
  }, [urlNetworkName, chains, history, chainId]);

  useEffect(() => {
    // guildConfigContext.setWeb3Context(web3Context);
    // guildConfigContext.initialize(web3Context);
  }, [web3Context, chainId]);

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    console.debug('[WalletWeb3Manager] Render: Eager load not tried');
    return null;
  }
  if (networkError || !networkActive) {
    console.debug('[WalletWeb3Manager] Render: Network error.');
    return null;
  } else {
    return children;
  }
};

export default WalletWeb3Manager;
