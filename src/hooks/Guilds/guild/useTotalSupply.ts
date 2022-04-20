
import { BigNumber } from 'ethers';
import { useMemo } from "react";

interface REPMintState {
    toAddress: string;
    amount: BigNumber;
  }

export const useTotalSupply = ({ decodedCall }) => {

    const parsedData = useMemo<REPMintState>(() => {
    if (!decodedCall) return null;
    return {
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
    }, [decodedCall]);

    return {
        parsedData,
    }
}
