import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useMemo } from 'react';
import { getContract } from '../utils/contracts';
import useEtherSWR from './ether-swr/useEtherSWR';
import { SWRResponse } from 'swr';

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
): SWRResponse => {
  return useContractCalls([
    {
      address,
      abi,
      functionName,
      params,
    },
  ]);
};

export const useContractCalls = (
  calls: {
    address: string;
    abi: any[];
    functionName: string;
    params: string[];
  }[]
): SWRResponse => {
  return useEtherSWR(
    calls.map(call => {
      return [call.address, call.functionName, ...call.params];
    }),
    {
      ABIs: new Map(calls.map(call => [call.address, call.abi])),
    }
  );
};
