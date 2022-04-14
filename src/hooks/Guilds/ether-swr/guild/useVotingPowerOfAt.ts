import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';
import useCurrentSnapshotId from './useCurrentSnapshotId';

interface useVotingPowerOfAtProps {
  contractAddress: string;
  userAddress: string;
  snapshotId?: string;
  fallbackSnapshotId?: boolean;
}

type useVotingPowerOfAtHook = (
  args: useVotingPowerOfAtProps
) => SWRResponse<BigNumber>;

/**
 * Get the voting power of an account at snapshot id
 */
const useVotingPowerOfAt: useVotingPowerOfAtHook = ({
  contractAddress,
  userAddress,
  snapshotId,
  fallbackSnapshotId = true,
}) => {
  const { data: currentSnapshotId } = useCurrentSnapshotId({ contractAddress });
  const SNAPSHOT_ID = fallbackSnapshotId
    ? snapshotId ?? currentSnapshotId?.toString()
    : snapshotId;
  return useEtherSWR(
    contractAddress && userAddress && SNAPSHOT_ID
      ? [contractAddress, 'votingPowerOfAt', userAddress, SNAPSHOT_ID]
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useVotingPowerOfAt;
