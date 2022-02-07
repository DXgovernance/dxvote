import { BigNumber } from 'ethers';
import { useMemo } from 'react';

export default function useVotingPowerPercent(
  userVotingPower: BigNumber,
  totalVotingPower: BigNumber,
  precision: number = 2
) {
  const votingPowerPercent = useMemo(() => {
    if (!userVotingPower || !totalVotingPower) return null;

    if (totalVotingPower.isZero()) return 0;

    const percent = userVotingPower
      .mul(100)
      .mul(Math.pow(10, precision))
      .div(totalVotingPower);
    return Math.round(percent.toNumber()) / Math.pow(10, precision);
  }, [totalVotingPower, userVotingPower, precision]);

  return votingPowerPercent;
}
