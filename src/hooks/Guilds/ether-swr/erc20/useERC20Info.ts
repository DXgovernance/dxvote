import useEtherSWR from '../useEtherSWR';
import ERC20ABI from '../../../../abis/ERC20.json';
import { useMemo } from 'react';

type ERC20Info = {
  name: string;
  symbol: string;
  decimals: number;
};

export const useERC20Info = (contractAddress: string) => {
  const { data, ...rest } = useEtherSWR(
    contractAddress
      ? [
          [contractAddress, 'name'],
          [contractAddress, 'symbol'],
          [contractAddress, 'decimals'],
        ]
      : [],
    {
      ABIs: new Map([[contractAddress, ERC20ABI]]),
    }
  );

  const transformedData: ERC20Info = useMemo(() => {
    if (!data) return undefined;

    return {
      name: data[0],
      symbol: data[1],
      decimals: data[2],
    };
  }, [data]);

  return { data: transformedData, ...rest };
};
