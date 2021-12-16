import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { useMemo } from 'react';
import ensRegistrarABI from '../../../abis/ENSRegistrar.json';
import { ENS_REGISTRAR_ADDRESS } from '../../../constants/addresses';
import { getContract } from '../../../utils/contracts';

export default function useENSRegistrar(web3Context?: string) {
  const { library } = useWeb3React(web3Context);

  const resolver = useMemo(() => {
    try {
      const provider = new Web3Provider(library.currentProvider);
      return getContract(ENS_REGISTRAR_ADDRESS, ensRegistrarABI, provider);
    } catch (e) {
      return null;
    }
  }, [library]);

  return resolver;
}
