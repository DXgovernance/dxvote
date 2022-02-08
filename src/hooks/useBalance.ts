import useEtherSWR from 'ether-swr';
import { id } from 'ethers/lib/utils';
import useSWR from 'swr';
import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { ZERO_ADDRESS } from 'utils/constants';
import useContract from './useContract';

const ERC20JSON = require("../contracts/ERC20.json");

export const useBalance = (
  fromAddress: string,
  assetAddress: string
): BigNumber => {
  const balanceCall = useEtherSWR(
    assetAddress == ZERO_ADDRESS
      ? ['getBalance', fromAddress]
      : [assetAddress, 'balanceOf', fromAddress],
    { ABIs: new Map([[assetAddress, ERC20JSON.abi]]) }
  );
  return balanceCall.data ? bnum(balanceCall.data.toString()) : bnum('0');
};

export const useAllowance = (
  tokenAddress: string,
  fromAddress: string,
  toAddress: string
): BigNumber => {

  const tokenContract = useContract(tokenAddress, ERC20JSON.abi);

  const { data } = useSWR(
    id(tokenAddress+fromAddress+toAddress),
    async () => {
      return await tokenContract.allowance(fromAddress, toAddress)
    }
   );

  return data ? bnum(data.toString()) : bnum('0');
};
