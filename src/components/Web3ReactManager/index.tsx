import React, { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import styled from 'styled-components';
import { web3ContextNames } from 'provider/connectors';
import { useEagerConnect, useInactiveListener } from 'provider/providerHooks';
import { useStores } from 'contexts/storesContext';
import { useInterval } from 'utils/helperHooks';

const BLOKCHAIN_FETCH_INTERVAL = 10000;

const Web3ReactManager = ({ children }) => {
    const {
        root: { providerStore, blockchainStore, daoStore },
    } = useStores();

    const web3ContextInjected = useWeb3React(web3ContextNames.injected);
    const {
        active: networkActive,
        error: networkError
    } = web3ContextInjected;

    providerStore.setWeb3Context(web3ContextNames.injected, web3ContextInjected);

    const web3React = providerStore.getActiveWeb3React();

    console.debug('[Web3ReactManager] Start of render', {
        injected: web3ContextInjected,
        web3React: web3React,
    });

    // try to eagerly connect to an injected provider, if it exists and has granted access already
    const triedEager = useEagerConnect();

    // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
    useInactiveListener(!triedEager);

    // Fetch user blockchain data on an interval using current params
    useInterval(
        () => blockchainStore.fetchData(web3React), BLOKCHAIN_FETCH_INTERVAL
    );
    // Fetch when account or web3Provider changes
    useEffect(() => {
        if (
            web3React.account &&
            web3React.account !== providerStore.activeAccount
        ) {
            console.debug('[Fetch Loop] - Extra fetch on account switch', {
                account: web3React.account,
                prevAccount: providerStore.activeAccount,
            });
            blockchainStore.fetchData(web3React);
        }
    }, [web3React, providerStore.activeAccount, blockchainStore]);

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
      background-color: rgb(0,0,0);
      background-color: rgba(0,0,0,0.4);
      
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
      console.debug('[Web3ReactManager] Render: Network error, showing modal error.');
      return (
        <div>
          <OverBlurModal>
            <div className="connectModalContent">Ups, something broke :(</div>
            </OverBlurModal>
            <BlurWrapper>
              {children}
            </BlurWrapper>
          </div>
        );
    // If network is not active show blur content
  } else if(!networkActive) {
        console.debug('[Web3ReactManager] Render: No active network');
        return children;
    } else {
      daoStore.getCache();
      console.debug( '[Web3ReactManager] Render: Active network, render children', { networkActive } );
      return children;
    }

};

export default Web3ReactManager;
