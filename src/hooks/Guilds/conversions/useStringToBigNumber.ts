import { parseUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';

export default function useStringToBigNumber(
  numString: string,
  decimals: number
) {
  const bigNumber = useMemo(() => {
    if (numString) {
      return parseUnits(numString, decimals);
    } else {
      return null;
    }
  }, [numString, decimals]);

  return bigNumber;
}
