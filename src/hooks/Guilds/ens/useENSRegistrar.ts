import { useMemo } from 'react';
import ensRegistrarABI from '../../../abis/ENSRegistrar.json';
import { ENS_REGISTRAR_ADDRESS } from '../../../constants/addresses';
import { getContract } from '../../../utils/contracts';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';

export default function useENSRegistrar(chainId?: number) {
  const provider = useJsonRpcProvider(chainId);

  const resolver = useMemo(() => {
    try {
      return getContract(ENS_REGISTRAR_ADDRESS, ensRegistrarABI, provider);
    } catch (e) {
      return null;
    }
  }, [provider]);

  return resolver;
}
