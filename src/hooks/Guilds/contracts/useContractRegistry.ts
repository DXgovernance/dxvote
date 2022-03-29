import { useWeb3React } from '@web3-react/core';
import { useMemo } from 'react';
import useIPFSFile from '../ipfs/useIPFSFile';

// TODO: Get the actual token registry hash
const CONTRACT_REGISTRY = 'QmUTUJRWKLEWAZPGKp92XYsWwEwrBj2BxMTKQbz8hDKTe7';

export interface RegistryContractFunctionParam {
  type: string;
  component: string;
  name: string;
  defaultValue: string;
  description: string;
}

export interface RegistryContractFunction {
  title: string;
  functionName: string;
  params: RegistryContractFunctionParam[];
  shortDescription: string;
  longDescription: string;
  spendsTokens: boolean;
}

export interface RegistryContract {
  title: string;
  tags: string[];
  networks: { [chainId: number]: string };
  functions: RegistryContractFunction[];
}

export const useContractRegistry = (chainId?: number) => {
  const { chainId: activeChainId } = useWeb3React();

  const { data, error } = useIPFSFile<RegistryContract[]>(CONTRACT_REGISTRY);

  const registryContracts = useMemo(() => {
    if (error || !data) return null;

    return data.filter(
      contract => !!contract.networks[chainId || activeChainId]
    );
  }, [chainId, activeChainId, data, error]);

  return {
    contracts: registryContracts,
  };
};
