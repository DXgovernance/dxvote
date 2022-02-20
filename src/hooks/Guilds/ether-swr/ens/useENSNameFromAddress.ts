import useEtherSWR from '../useEtherSWR';
import useJsonRpcProvider from '../../web3/useJsonRpcProvider';

export default function useENSNameFromAddress(
  ensAddress?: string,
  chainId?: number
) {
  const provider = useJsonRpcProvider(chainId);
  const { data: ensName } = useEtherSWR<string>(
    ensAddress ? ['lookupAddress', ensAddress] : [],
    {
      web3Provider: provider,
    }
  );

  return ensName;
}
