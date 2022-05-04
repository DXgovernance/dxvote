import { BigNumber } from 'ethers';
import { useMemo } from 'react';

interface RepMintState {
  toAddress: string;
  amount: BigNumber;
}

export const useTotalSupply = ({ decodedCall }) => {
  const parsedData = useMemo<RepMintState>(() => {
    if (!decodedCall) return null;
    return {
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
  }, [decodedCall]);

  return {
    parsedData,
  };
};
