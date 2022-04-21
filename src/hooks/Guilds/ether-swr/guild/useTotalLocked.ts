import { useParams } from 'react-router-dom';
import ERC20GuildContract from 'contracts/ERC20Guild.json';
import useEtherSWR from '../useEtherSWR';
import useTotalLockedAt from 'hooks/Guilds/ether-swr/guild/useTotalLockedAt';
import useSnapshotId from 'hooks/Guilds/ether-swr/guild/useSnapshotId';
import useGuildImplementationType from 'hooks/Guilds/guild/useGuildImplementationType';
import useGuildToken from './useGuildToken';
import useCurrentSnapshotId from './useCurrentSnapshotId';
import useTotalSupplyAt from './useTotalSupplyAt';

const useTotalLocked = (guildAddress: string, snapshotId?: string) => {
  // Hooks call
  const { data: currentSnapshotId } = useCurrentSnapshotId({
    contractAddress: guildAddress,
  });

  const { proposal_id: proposalId } = useParams<{ proposal_id?: string }>();
  const { data: _snapshotId } = useSnapshotId({
    contractAddress: guildAddress,
    proposalId,
  });

  const SNAPSHOT_ID =
    snapshotId ?? _snapshotId?.toString() ?? currentSnapshotId?.toString();

  const { isSnapshotGuild, isRepGuild, isSnapshotRepGuild } =
    useGuildImplementationType(guildAddress);

  const totalLockedResponse = useEtherSWR(
    guildAddress ? [guildAddress, 'getTotalLocked'] : [],
    {
      ABIs: new Map([[guildAddress, ERC20GuildContract.abi]]),
      refreshInterval: 0,
    }
  );
  const totalLockedAtProposalSnapshotResponse = useTotalLockedAt({
    contractAddress: guildAddress,
    snapshotId: SNAPSHOT_ID,
  });

  const { data: guildTokenAddress } = useGuildToken(guildAddress);

  const totalSupplyAtSnapshotResponse = useTotalSupplyAt({
    contractAddress: guildTokenAddress,
    snapshotId: SNAPSHOT_ID,
  });

  // Return response based on implementation type
  if (isSnapshotGuild) return totalLockedAtProposalSnapshotResponse;
  if (isSnapshotRepGuild) return totalSupplyAtSnapshotResponse;
  if (isRepGuild) return totalLockedResponse;
  return totalLockedResponse;
};

export default useTotalLocked;
