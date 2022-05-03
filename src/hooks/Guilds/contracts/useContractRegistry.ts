import { useWeb3React } from '@web3-react/core';
import { utils } from 'ethers';
import { useMemo } from 'react';
import useIPFSFile from '../ipfs/useIPFSFile';

// TODO: Get the actual token registry hash
const CONTRACT_REGISTRY = 'QmXk294ZQebU6J7yYpAhBqBPaMquCKxGmGoNHLBpvUJ9on';

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
  contractAddress: string;
  contractInterface: utils.Interface;
}

type IPFSRegistryContract = Omit<
  RegistryContract,
  'contractAddress' | 'contractInterface'
>;

export const useContractRegistry = (chainId?: number) => {
  const { chainId: activeChainId } = useWeb3React();

  const { data, error } =
    useIPFSFile<IPFSRegistryContract[]>(CONTRACT_REGISTRY);

  const registryContracts: RegistryContract[] = useMemo(() => {
    if (error || !data) return null;

    return data
      .filter(contract => !!contract.networks[chainId || activeChainId])
      .map(contract => {
        // Construct the Ethers Contract interface from registry data
        const contractInterface = new utils.Interface(
          contract.functions.map(f => {
            const name = f.functionName;
            const params = f.params.reduce(
              (acc, cur, i) =>
                acc.concat(
                  `${cur.type} ${cur.name}`,
                  i === f.params.length - 1 ? '' : ', '
                ),
              ''
            );
            return `function ${name}(${params})`;
          })
        );

        return {
          ...contract,
          contractAddress: contract.networks[chainId || activeChainId],
          contractInterface,
        };
      });
  }, [chainId, activeChainId, data, error]);

  return {
    contracts: registryContracts,
  };
};
