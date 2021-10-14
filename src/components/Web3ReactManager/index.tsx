import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import {
  DEFAULT_ETH_CHAIN_ID,
  getChains,
  getNetworkConnector,
  web3ContextNames,
} from 'provider/connectors';
import {
  useActiveWeb3React,
  useEagerConnect,
  useInactiveListener,
  useRpcUrls,
} from 'provider/providerHooks';
import { useContext } from 'contexts';
import { useInterval, usePrevious } from 'utils';

const BLOKCHAIN_FETCH_INTERVAL = 10000;

const Web3ReactManager = ({ children }) => {
  const {
    context: { providerStore, blockchainStore, userStore },
  } = useContext();
  const location = useLocation();
  const { activate } = useActiveWeb3React();
  const rpcUrls = useRpcUrls();
  const history = useHistory();

  const web3ContextInjected = useWeb3React(web3ContextNames.injected);
  const {
    active: networkActive,
    error: networkError,
    chainId,
  } = web3ContextInjected;

  if (!providerStore.activeChainId)
    providerStore.setWeb3Context(
      web3ContextNames.injected,
      web3ContextInjected
    );

  console.debug('[Web3ReactManager] Start of render', {
    injected: web3ContextInjected,
    web3React: providerStore.getActiveWeb3React(),
  });

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

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

  function switchChainAndReload(chainId) {
    const chains = getChains(rpcUrls);
    const chain = chains.find(chain => chain.id == chainId);

    if (chain) {
      history.push(`/${chain.name}/proposals`);
    }

    window.location.reload();
  }

  try {
    // @ts-ignore
    ethereum.on('chainChanged', chainId => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.
      // providerStore.setWeb3Context(web3ContextNames.injected, web3ContextInjected);
      // blockchainStore.fetchData(providerStore.getActiveWeb3React(), true);
      switchChainAndReload(chainId);
    });

    // @ts-ignore
    ethereum.on('accountsChanged', accounts => {
      // Handle the new accounts, or lack thereof.
      // "accounts" will always be an array, but it can be empty.
      // blockchainStore.fetchData(web3React, false);
      if (networkActive) userStore.update(providerStore.getActiveWeb3React());
    });
  } catch (error) {
    console.debug(
      '[Web3ReactManager] Render: Ethereum Provider not available.'
    );
  }

  const prevChainId = usePrevious(chainId);
  useEffect(() => {
    if (
      (prevChainId && !chainId) ||
      (prevChainId && chainId && prevChainId !== chainId)
    ) {
      switchChainAndReload(chainId);
    }
  }, [chainId, prevChainId]);

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager);

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

  const BlurWrapper = styled.div`
    filter: blur(1px);
  `;

  const OverBlurModal = styled.div`
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);

    .connectModalContent {
      background-color: #fefefe;
      max-width: 350px;
      text-align: center;
      margin: 15% auto;
      padding: 20px;
      border-radius: 4px;
    }
  `;

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    console.debug('[Web3ReactManager] Render: Eager load not tried');
    return null;
  }
  if (networkError) {
    console.debug(
      '[Web3ReactManager] Render: Network error, showing modal error.'
    );
    return (
      <div>
        <OverBlurModal>
          <div className="connectModalContent">Ups, something broke :(</div>
        </OverBlurModal>
        <BlurWrapper>{children}</BlurWrapper>
      </div>
    );
  } else if (prevChainId && chainId && prevChainId !== chainId) {
    // Stop rendering if networks are being switched
    console.debug('[Web3ReactManager] Render: Switching network', {
      chainId,
      prevChainId,
    });
    return null;
  } else if (!chainId) {
    console.debug('[Web3ReactManager] Render: No chain ID');
    return null;
  } else if (!networkActive) {
    console.debug('[Web3ReactManager] Render: No active network');
    return children;
  } else {
    console.debug(
      '[Web3ReactManager] Render: Active network, render children',
      { networkActive }
    );
    return children;
  }
};

export default Web3ReactManager;
