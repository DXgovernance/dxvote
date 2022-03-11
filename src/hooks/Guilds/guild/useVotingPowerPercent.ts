import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { getBigNumberPercentage } from 'utils/bnPercentage';

export default function useVotingPowerPercent(
  userVotingPower: BigNumber,
  totalVotingPower: BigNumber,
  precision: number = 2
) {
  const votingPowerPercent = useMemo(() => {
    return getBigNumberPercentage(userVotingPower, totalVotingPower, precision);
  }, [totalVotingPower, userVotingPower, precision]);

  return votingPowerPercent;
}
