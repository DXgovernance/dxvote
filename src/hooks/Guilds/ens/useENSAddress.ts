import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { useEffect, useState } from 'react';
import { MAINNET_WEB3_ROOT_KEY } from '../../../components/MainnetWeb3Manager';

export default function useENSAddress(
  ensName: string,
  web3Context = MAINNET_WEB3_ROOT_KEY
) {
  const [isLoading, setIsLoading] = useState(true);
  const [ensAddress, setENSAddress] = useState<string | null>(null);
  const { library } = useWeb3React(web3Context);

  useEffect(() => {
    setENSAddress(null);
    if (!ensName) return;

    setIsLoading(true);
    try {
      const provider = new Web3Provider(library.currentProvider);
      provider.resolveName(ensName).then(setENSAddress);
    } catch (e) {
      console.warn(
        '[useENSAddress] Error while trying to resolve ENS address.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ensName, library]);

  return {
    address: ensAddress,
    loading: isLoading,
  };
}
