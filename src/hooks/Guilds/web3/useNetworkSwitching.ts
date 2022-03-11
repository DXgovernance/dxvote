import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useHistory } from 'react-router-dom';
import { ChainConfig } from 'types/types';

const useNetworkSwitching = () => {
  const { connector, deactivate } = useWeb3React();
  const history = useHistory();

  const trySwitching = async (chain: ChainConfig) => {
    if (connector instanceof InjectedConnector) {
      const chainIdHex = `0x${chain.id.toString(16)}`;
      try {
        await window.ethereum?.send('wallet_switchEthereumChain', [
          { chainId: chainIdHex },
        ]);
      } catch (e: any) {
        window.ethereum?.send('wallet_addEthereumChain', [
          {
            chainId: chainIdHex,
            chainName: chain.displayName,
            nativeCurrency: chain.nativeAsset,
            rpcUrls: [chain.rpcUrl, chain.defaultRpc],
            blockExplorerUrls: [chain.blockExplorer],
          },
        ]);
      }
    }

    deactivate();

    history.push(`/${chain.name}`);
  };

  return {
    trySwitching,
  };
};

export default useNetworkSwitching;
