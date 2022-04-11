import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import useGuildImplementationType from '../../guild/useGuildImplementationType';
import useVotingPowerOfAt from './useVotingPowerOfAt';
import ERC20GuildContract from 'contracts/ERC20Guild.json';

interface UseVotingPowerOfProps {
  contractAddress: string;
  userAddress: string;
  snapshotId?: string;
  fallbackSnapshotId?: boolean;
}

type UseVotingPowerOfHook = (
  args: UseVotingPowerOfProps
) => SWRResponse<BigNumber>;

/**
 * Get the voting power of an account
 */
export const useVotingPowerOf: UseVotingPowerOfHook = ({
  contractAddress,
  userAddress,
  snapshotId,
  fallbackSnapshotId = true,
}) => {
  const { isSnapshotGuild } = useGuildImplementationType(contractAddress);

  const votingPowerOfResponse = useEtherSWR(
    contractAddress && userAddress
      ? [contractAddress, 'votingPowerOf', userAddress]
      : [],
    {
      ABIs: new Map([[contractAddress, ERC20GuildContract.abi]]),
      refreshInterval: 0,
    }
  );

  const votingPowerAtSnapshotResponse = useVotingPowerOfAt({
    contractAddress,
    userAddress,
    snapshotId,
    fallbackSnapshotId,
  });

  if (isSnapshotGuild) return votingPowerAtSnapshotResponse;
  return votingPowerOfResponse;
};
