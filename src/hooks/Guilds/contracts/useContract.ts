import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { useMemo } from 'react';
import { getContract } from '../../../utils/contracts';
import ERC20Guild_ABI from '../../../abis/ERC20Guild.json'
//import { ERC20Guild } from '../../../types/ERC20Guild'

export default function useContract<T extends Contract = Contract>(
  contractId: string,
  abi: any,
  web3Context?: string
): T | null {

  const { library } = useWeb3React(web3Context);
  return useMemo(() => {
    if (!library) return null
    try {
      const provider = new Web3Provider(library.currentProvider);
      const contract = getContract(contractId, abi, provider);
      return contract;
    } catch (e) {
      console.error(e)
      return null
    }
  }, [contractId, abi, web3Context, library]) as T
}

export function useERC20Guild(contractId: string, web3Context?: string) {
  return useContract(contractId, ERC20Guild_ABI.abi, web3Context)
}

