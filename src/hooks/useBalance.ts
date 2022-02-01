import useEtherSWR from 'ether-swr';
import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { ZERO_ADDRESS } from 'utils/constants';

const ERC20BalanceOfABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
export const useBalance = (
  fromAddress: string,
  assetAddress: string
): BigNumber => {
  const balanceCall = useEtherSWR(
    assetAddress == ZERO_ADDRESS
      ? ['getBalance', fromAddress]
      : [assetAddress, 'balanceOf', fromAddress],
    { ABIs: new Map([[assetAddress, ERC20BalanceOfABI]]) }
  );
  return balanceCall.data ? bnum(balanceCall.data.toString()) : bnum('0');
};
