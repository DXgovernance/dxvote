import { utils } from 'ethers';
import { useMemo } from 'react';
import ensResolverABI from '../../../../abis/ENSPublicResolver.json';
import useJsonRpcProvider from '../../web3/useJsonRpcProvider';
import useEtherSWR from '../useEtherSWR';
import useENSRegistry from './useENSRegistry';

interface ENSPublicResolverData {
  avatarUri?: string;
}

export default function useENSPublicResolver(
  ensName: string,
  chainId?: number
) {
  const provider = useJsonRpcProvider(chainId);
  const { resolverAddress } = useENSRegistry(ensName, chainId);

  const { data } = useEtherSWR(
    resolverAddress
      ? [[resolverAddress, 'text', utils.namehash(ensName), 'avatar']]
      : [],
    {
      ABIs: new Map([[resolverAddress, ensResolverABI]]),
      web3Provider: provider,
    }
  );

  const result: ENSPublicResolverData = useMemo(() => {
    if (!data) return {};

    const [avatarUri] = data;
    return {
      avatarUri,
    };
  }, [data]);

  return result;
}
