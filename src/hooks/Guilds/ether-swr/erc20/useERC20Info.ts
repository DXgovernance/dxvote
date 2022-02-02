import useEtherSWR from '../useEtherSWR';
import ERC20ABI from '../../../../abis/ERC20.json';
import { useMemo } from 'react';

interface ERC20InfoInterface {
  name: string;
  symbol: string;
}

export const useERC20Info = (contractAddress: string) => {
  const { data, ...rest } = useEtherSWR<[string, string]>(
    [
      [contractAddress, 'name'],
      [contractAddress, 'symbol'],
    ],
    {
      ABIs: new Map([[contractAddress, ERC20ABI]]),
    }
  );

  const transformedData: ERC20InfoInterface = useMemo(() => {
    if (!data) return undefined;

    return {
      name: data[0],
      symbol: data[1],
    };
  }, [data]);

  return { data: transformedData, ...rest };
};
