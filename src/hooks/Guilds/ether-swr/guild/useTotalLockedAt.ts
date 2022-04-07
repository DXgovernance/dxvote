import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';

interface UseTotalLockedAtProps {
  contractAddress: string;
  snapshotId: string;
}

type UseTotalLockedAtHook = (
  args: UseTotalLockedAtProps
) => SWRResponse<BigNumber>;

/**
 * Get the total locked amount at snapshot
 */
const useTotalLockedAt: UseTotalLockedAtHook = ({
  contractAddress,
  snapshotId,
}) => {
  return useEtherSWR(
    snapshotId && contractAddress
      ? [contractAddress, 'totalLockedAt', snapshotId]
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
    }
  );
};

export default useTotalLockedAt;
