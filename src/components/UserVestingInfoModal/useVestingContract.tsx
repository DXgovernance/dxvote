import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { useMemo } from 'react';
import { getContract } from '../../utils/contracts';

export default function useVestingContract({ address, abi }) {
  const { library } = useWeb3React();

  const resolver = useMemo(() => {
    try {
      const provider = new Web3Provider(library.currentProvider);
      return getContract(address, abi, provider);
    } catch (e) {
      return null;
    }
  }, [library, abi, address]);

  return resolver;
}
