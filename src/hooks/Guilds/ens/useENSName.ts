import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useEffect, useState } from 'react';
import { MAINNET_WEB3_ROOT_KEY } from '../../../components/MainnetWeb3Manager';

export default function useENSName(
  ensAddress?: string,
  web3Context = MAINNET_WEB3_ROOT_KEY
) {
  const [isLoading, setIsLoading] = useState(true);
  const [ensName, setENSName] = useState<string | null>(null);
  const { library } = useWeb3React(web3Context);

  useEffect(() => {
    setENSName(null);
    if (!ensAddress) return;

    setIsLoading(true);
    try {
      const provider = new providers.Web3Provider(library.currentProvider);
      provider.lookupAddress(ensAddress).then(setENSName);
    } catch (e) {
      console.warn(
        '[useENSName] Error while trying to reverse resolve ENS name.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ensAddress, library]);

  return {
    ensName: ensName,
    loading: isLoading,
  };
}
