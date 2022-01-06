import { Contract } from 'ethers';
import { useMemo } from 'react';
import { getContract } from '../../../utils/contracts';
import ERC20Guild_ABI from '../../../contracts/ERC20Guild.json';
import { ERC20Guild } from '../../../types/ERC20Guild';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';

export default function useContract<T extends Contract>(
  contractId: string,
  abi: any,
  chainId?: number
): T | null {
  const provider = useJsonRpcProvider(chainId);
  console.log("useContract", contractId, abi, chainId, provider);
  return useMemo(() => {
    if (!provider) return null;
    try {
      const contract = getContract(contractId, abi, provider);
      return contract;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [contractId, abi, provider]) as unknown as T;
}

export function useERC20Guild(contractId: string, chainId?: number) {
  return useContract<ERC20Guild>(contractId, ERC20Guild_ABI.abi, chainId);
}
