import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useMemo } from 'react';
import { getContract } from '../utils/contracts';

export default function useContract(address, abi) {
  const { library } = useWeb3React();

  const resolver = useMemo(() => {
    try {
      const provider = new providers.Web3Provider(library.currentProvider);
      return getContract(address, abi, provider);
    } catch (e) {
      return null;
    }
  }, [library, abi, address]);

  return resolver;
}
