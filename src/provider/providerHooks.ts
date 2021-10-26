import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { isMobile } from 'react-device-detect';
import { getChains, injected } from '../provider/connectors';
import { useContext } from '../contexts';
import { DEFAULT_RPC_URLS } from '../utils';

/*  Attempt to connect to & activate injected connector
    If we're on mobile and have an injected connector, attempt even if not authorized (legacy support)
    If we tried to connect, or it's active, return true;
 */
export function useEagerConnect() {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const chains = getChains();
    const urlNetworkName = location.pathname.split('/')[1];
    const urlChainId =
      chains.find(chain => chain.name == urlNetworkName)?.id || null;
    const urlChainIdHex = urlChainId ? `0x${urlChainId.toString(16)}` : null;

    const tryConnecting = async () => {
      const isAuthorized = await injected.isAuthorized();
      console.debug('[EagerConnect] Activate injected if authorized', {
        injected,
        isAuthorized,
      });

      try {
        const injectedChainId = await injected.getChainId();
        if (injectedChainId != urlChainIdHex) {
          setTried(true);
          return;
        }
      } catch (error) {
        console.error(error);
        setTried(true);
      }

      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    };

    tryConnecting().catch(() => {
      setTried(true);
    });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

export function useRpcUrls() {
  const {
    context: { infuraService, alchemyService, customRpcService, configStore },
  } = useContext();
  const preferredRpc = configStore.getLocalConfig().rpcType;
  const [rpcUrls, setRpcUrls] = useState(null);

  useEffect(() => {
    getRpcUrls().then(urls => setRpcUrls(urls));
  }, [preferredRpc]);

  async function getRpcUrls() {
    await alchemyService.isAuthenticated();
    await infuraService.isAuthenticated();
    await customRpcService.isAuthenticated();

    if (preferredRpc === 'infura' && infuraService.auth) {
      return infuraService.getRpcUrls();
    } else if (preferredRpc === 'alchemy' && alchemyService.auth) {
      return alchemyService.getRpcUrls();
    } else if (preferredRpc === 'custom' && customRpcService.auth) {
      return customRpcService.getRpcUrls();
    } else {
      return DEFAULT_RPC_URLS;
    }
  }

  return rpcUrls;
}
