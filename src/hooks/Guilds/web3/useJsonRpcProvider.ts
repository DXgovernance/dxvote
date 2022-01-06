import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useContext, useMemo } from 'react';
import { MultichainContext } from '../../../contexts/MultichainProvider';

export default function useJsonRpcProvider(chainId?: number) {
  const { providers: multichainProviders } = useContext(MultichainContext);

  const { library, chainId: walletChainId } = useWeb3React();

  return useMemo(
    () =>
      (!chainId || walletChainId === chainId) && library
        ? new providers.Web3Provider(library.currentProvider)
        : multichainProviders[chainId],
    [library, chainId, walletChainId, multichainProviders]
  );
}
