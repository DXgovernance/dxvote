import useEtherSWR from '../useEtherSWR';
import useJsonRpcProvider from '../../useJsonRpcProvider';

export default function useAddressFromENSName(
  ensName: string,
  chainId?: number
) {
  const provider = useJsonRpcProvider(chainId);
  const { data: ensAddress } = useEtherSWR<string>(
    ensName ? ['resolveName', ensName] : [],
    {
      web3Provider: provider,
    }
  );

  return ensAddress;
}
