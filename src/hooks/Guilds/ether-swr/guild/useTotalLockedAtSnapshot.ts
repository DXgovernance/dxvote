import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import useSnapshotId from './useSnapshotId';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';

interface UseTotalLockedAtSnapshotProps {
  contractAddress: string;
  proposalId: string;
}

type UseTotalLockedAtSnapshotHook = (
  args: UseTotalLockedAtSnapshotProps
) => SWRResponse<BigNumber>;

const useTotalLockedAtSnapshot: UseTotalLockedAtSnapshotHook = ({
  contractAddress,
  proposalId,
}) => {
  const { data: snapshotId } = useSnapshotId({ contractAddress, proposalId });
  return useEtherSWR(
    snapshotId && contractAddress
      ? [contractAddress, 'totalLockedAt', snapshotId.toString()]
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
    }
  );
};

export default useTotalLockedAtSnapshot;
