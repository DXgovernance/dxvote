import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { useContractCall } from './useContract';

const ERC20JSON = require('../contracts/ERC20.json');

export const useBalance = (
  fromAddress: string,
  assetAddress: string
): BigNumber => {
  const balance = useContractCall(assetAddress, ERC20JSON.abi, 'balanceOf', [
    fromAddress,
  ]);

  return balance ? bnum(balance) : bnum('0');
};

export const useAllowance = (
  tokenAddress: string,
  fromAddress: string,
  toAddress: string
): BigNumber => {
  const allowance = useContractCall(tokenAddress, ERC20JSON.abi, 'allowance', [
    fromAddress,
    toAddress,
  ]);

  return allowance ? bnum(allowance) : bnum('0');
};
