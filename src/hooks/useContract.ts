import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { id } from 'ethers/lib/utils';
import { useMemo } from 'react';
import useSWR from 'swr';
import { getContract } from '../utils/contracts';

export const useContract = function (address: string, abi: any[]) {
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
};

export const useContractCall = (
  address: string,
  abi: any[],
  functionName: string,
  params: string[]
): string => {
  const { active, library } = useWeb3React();
  const { data } = useSWR(id(address + functionName + params), async () => {
    if (!active) return '0x0';

    const provider = new providers.Web3Provider(library.currentProvider);
    const tokenContract = getContract(address, abi, provider);
    return await tokenContract[functionName](...params);
  });

  return data ? data.toString() : '0x0';
};
