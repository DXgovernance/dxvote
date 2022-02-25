import { useWeb3React } from '@web3-react/core';
import { providers } from 'ethers';
import { id } from 'ethers/lib/utils';
import useSWR from 'swr';
import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { ZERO_ADDRESS } from 'utils/constants';
import { getContract } from 'utils/contracts';

const ERC20JSON = require('../contracts/ERC20.json');

export const useBalance = (
  fromAddress: string,
  assetAddress: string
): BigNumber => {
  const { active, library } = useWeb3React();

  const { data } = useSWR(id(fromAddress + assetAddress), async () => {
    if (!active) return bnum(0);

    const provider = new providers.Web3Provider(library.currentProvider);
    const tokenContract = getContract(assetAddress, ERC20JSON.abi, provider);
    if (assetAddress == ZERO_ADDRESS)
      return await library.eth.getBalance(fromAddress);
    else return await tokenContract.balanceOf(fromAddress);
  });

  return data ? bnum(data.toString()) : bnum('0');
};

export const useAllowance = (
  tokenAddress: string,
  fromAddress: string,
  toAddress: string
): BigNumber => {
  const { active, library } = useWeb3React();

  const { data } = useSWR(
    id(tokenAddress + fromAddress + toAddress),
    async () => {
      if (!active) return bnum(0);

      const provider = new providers.Web3Provider(library.currentProvider);
      const tokenContract = getContract(tokenAddress, ERC20JSON.abi, provider);
      return await tokenContract.allowance(fromAddress, toAddress);
    }
  );

  return data ? bnum(data.toString()) : bnum('0');
};
