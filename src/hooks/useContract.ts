import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { useMemo } from 'react';
import { getContract } from '../utils/contracts';
import useEtherSWR from './Guilds/ether-swr/useEtherSWR';

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
  params: string
): string => {
  const { data } = useContractCalls([
    {
      address,
      abi,
      functionName,
      params,
    },
  ]);

  return data ? data.toString() : '0x0';
};

export const useContractCalls = (
  calls: {
    address: string;
    abi: any[];
    functionName: string;
    params: string;
  }[]
) => {
  const { data, error, isValidating, mutate } = useEtherSWR(
    calls.map(call => [call.address, call.functionName, call.params]),
    {
      ABIs: new Map(calls.map(call => [call.address, call.abi])),
      refreshInterval: 0,
    }
  );

  return {
    error,
    isValidating,
    mutate,
    data,
  };
};
