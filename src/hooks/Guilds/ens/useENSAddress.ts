import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useEffect, useState } from 'react';
import useLocalStorageWithExpiry from '../useLocalStorageWithExpiry';
import { MAINNET_WEB3_ROOT_KEY } from '../../../components/RootWeb3Manager';

export default function useENSAddress(
  ensName: string,
  web3Context = MAINNET_WEB3_ROOT_KEY
) {
  const [isLoading, setIsLoading] = useState(true);
  const [ensAddress, setENSAddress] = useLocalStorageWithExpiry<string>(
    `ens/address/${ensName}`,
    null
  );
  const { library } = useWeb3React(web3Context);

  useEffect(() => {
    if (!ensName || ensAddress) return;

    setIsLoading(true);
    try {
      const provider = new providers.Web3Provider(library.currentProvider);
      provider.resolveName(ensName).then(setENSAddress);
    } catch (e) {
      console.warn(
        '[useENSAddress] Error while trying to resolve ENS address.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ensName, library, ensAddress, setENSAddress]);

  return {
    address: ensAddress,
    loading: isLoading,
  };
}
