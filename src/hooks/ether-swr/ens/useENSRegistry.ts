import { utils } from 'ethers';
import { useMemo } from 'react';
import ensRegistrarABI from '../../../abis/ENSRegistrar.json';
import { ENS_REGISTRAR_ADDRESS } from '../../../constants/addresses';
import useEtherSWR from '../useEtherSWR';
import useJsonRpcProvider from '../../useJsonRpcProvider';

type ENSRegistryData = {
  resolverAddress?: string;
};

export default function useENSRegistry(ensName: string, chainId?: number) {
  const provider = useJsonRpcProvider(chainId);
  const { data } = useEtherSWR(
    ensName
      ? [[ENS_REGISTRAR_ADDRESS, 'resolver', utils.namehash(ensName)]]
      : [],
    {
      ABIs: new Map([[ENS_REGISTRAR_ADDRESS, ensRegistrarABI]]),
      web3Provider: provider,
    }
  );

  const result: ENSRegistryData = useMemo(() => {
    if (!data) return {};

    return {
      resolverAddress: data[0],
    };
  }, [data]);

  return result;
}
