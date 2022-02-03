import useEtherSWR from '../useEtherSWR';
import ERC20ABI from '../../../../abis/ERC20.json';
import { useMemo } from 'react';
import { BigNumber } from 'ethers';

export const useERC20Allowance = (
  contractAddress: string,
  walletAddress: string,
  spenderAddress: string
) => {
  const { data, ...rest } = useEtherSWR(
    contractAddress && walletAddress
      ? [contractAddress, 'allowance', walletAddress, spenderAddress]
      : [],
    {
      ABIs: new Map([[contractAddress, ERC20ABI]]),
    }
  );

  const parsed = useMemo(() => {
    if (!data) return undefined;

    return BigNumber.from(data);
  }, [data]);

  return { data: parsed, ...rest };
};
