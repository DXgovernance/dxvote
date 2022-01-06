import { useEffect, useState } from 'react';
import useLocalStorageWithExpiry from '../useLocalStorageWithExpiry';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';

export default function useENSAddress(
  ensName: string,
  chainId?: number
) {
  const [isLoading, setIsLoading] = useState(true);
  const [ensAddress, setENSAddress] = useLocalStorageWithExpiry<string>(
    `ens/address/${ensName}`,
    null
  );
  const provider = useJsonRpcProvider(chainId);

  useEffect(() => {
    if (!ensName || ensAddress) return;

    setIsLoading(true);
    try {
      provider.resolveName(ensName).then(setENSAddress);
    } catch (e) {
      console.warn(
        '[useENSAddress] Error while trying to resolve ENS address.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ensName, provider, ensAddress, setENSAddress]);

  return {
    address: ensAddress,
    loading: isLoading,
  };
}
