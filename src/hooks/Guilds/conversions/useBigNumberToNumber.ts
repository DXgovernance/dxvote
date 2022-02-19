import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';

export default function useBigNumberToNumber(
  number: BigNumber,
  decimals: number,
  precision: number = 2
) {
  const stakeAmountParsed = useMemo(() => {
    if (!number || !decimals) return null;

    let formatted = Number.parseFloat(formatUnits(number, decimals));
    return (
      Math.round(formatted * Math.pow(10, precision)) / Math.pow(10, precision)
    );
  }, [number, decimals, precision]);

  return stakeAmountParsed;
}
