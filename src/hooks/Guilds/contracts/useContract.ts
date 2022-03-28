import { Contract } from 'ethers';
import { useMemo } from 'react';
import { getContract } from '../../../utils/contracts';
import ERC20Guild_ABI from '../../../contracts/ERC20Guild.json';
import { ERC20Guild } from '../../../types/contracts/ERC20Guild';
import ERC20_ABI from '../../../contracts/ERC20.json';
import { ERC20 } from '../../../types/contracts/ERC20';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import { useWeb3React } from '@web3-react/core';

export default function useContract<T extends Contract>(
  contractId: string,
  abi: any,
  chainId?: number,
  withSignerIfPossible = true
): T | null {
  const provider = useJsonRpcProvider(chainId);
  const { chainId: walletChainId, account } = useWeb3React();

  return useMemo(() => {
    if (!provider || !contractId || !abi) return null;
    try {
      const signingAccount =
        !chainId || walletChainId === chainId ? account : null;
      const contract = getContract(
        contractId,
        abi,
        provider,
        withSignerIfPossible && signingAccount ? signingAccount : undefined
      );
      return contract;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    contractId,
    abi,
    provider,
    account,
    chainId,
    walletChainId,
    withSignerIfPossible,
  ]) as unknown as T;
}

export function useERC20Guild(
  contractId: string,
  withSignerIfPossible?: boolean,
  chainId?: number
) {
  return useContract<ERC20Guild>(
    contractId,
    ERC20Guild_ABI.abi,
    chainId,
    withSignerIfPossible
  );
}

export function useERC20(
  tokenAddress?: string,
  chainId?: number,
  withSignerIfPossible?: boolean
) {
  return useContract<ERC20>(
    tokenAddress,
    ERC20_ABI.abi,
    chainId,
    withSignerIfPossible
  );
}
