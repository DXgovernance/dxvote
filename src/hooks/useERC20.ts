import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { useContractCalls } from './useContract';

const ERC20JSON = require('../contracts/ERC20.json');

export const useBalance = (
  fromAddress: string,
  assetAddress: string
): BigNumber => {
  const { data, error } = useContractCalls([
    {
      address: assetAddress,
      abi: ERC20JSON.abi,
      functionName: 'balanceOf',
      params: [fromAddress],
    },
  ]);
  if (error) return bnum('0');
  else if (!data) return bnum('0');
  else return bnum(data[0]);
};

export const useAllowance = (
  tokenAddress: string,
  fromAddress: string,
  toAddress: string
): BigNumber => {
  const { data, error } = useContractCalls([
    {
      address: tokenAddress,
      abi: ERC20JSON.abi,
      functionName: 'allowance',
      params: [fromAddress, toAddress],
    },
  ]);
  if (error) return bnum('0');
  else if (!data) return bnum('0');
  else return bnum(data[0]);
};

export const useBalances = (
  calls: {
    fromAddress: string;
    assetAddress: string;
  }[]
): any => {
  const { data, error } = useContractCalls(
    calls.map(call => ({
      address: call.assetAddress,
      abi: ERC20JSON.abi,
      functionName: 'balanceOf',
      params: [call.fromAddress],
    }))
  );
  if (error) return [];
  else if (!data) return [];
  else return data;
};
