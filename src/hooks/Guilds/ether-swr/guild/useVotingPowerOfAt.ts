import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';

interface useVotingPowerOfAtProps {
  contractAddress: string;
  userAddress: string;
  snapshotId: string;
}

type useVotingPowerOfAtHook = (
  args: useVotingPowerOfAtProps
) => SWRResponse<BigNumber>;

/**
 * Get the voting power of an account at snapshot id
 */
export const useVotingPowerOfAt: useVotingPowerOfAtHook = ({
  contractAddress,
  userAddress,
  snapshotId,
}) =>
  useEtherSWR(
    contractAddress && snapshotId && userAddress
      ? [contractAddress, 'votingPowerOf', userAddress, snapshotId]
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
    }
  );
