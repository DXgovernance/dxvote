import { useEffect, useState } from 'react';
import useLocalStorageWithExpiry from '../useLocalStorageWithExpiry';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';

export default function useENSName(ensAddress?: string, chainId?: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [ensName, setENSName] = useLocalStorageWithExpiry<string>(
    `ens/name/${ensAddress}`,
    null
  );
  const provider = useJsonRpcProvider(chainId);

  useEffect(() => {
    if (!ensAddress || ensName) return;

    setIsLoading(true);
    try {
      provider.lookupAddress(ensAddress).then(setENSName);
    } catch (e) {
      console.warn(
        '[useENSName] Error while trying to reverse resolve ENS name.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ensAddress, provider, ensName, setENSName]);

  return {
    ensName: ensName,
    loading: isLoading,
  };
}
