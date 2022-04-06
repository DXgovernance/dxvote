import { useParams } from 'react-router-dom';
import ERC20GuildContract from 'contracts/ERC20Guild.json';
import useEtherSWR from '../useEtherSWR';
import useTotalLockedAt from 'hooks/Guilds/ether-swr/guild/useTotalLockedAt';
import useSnapshotId from 'hooks/Guilds/ether-swr/guild/useSnapshotId';
import useGuildImplementationType from 'hooks/Guilds/guild/useGuildImplementationType';

const useTotalLocked = (guildAddress: string) => {
  // Hooks call
  const { proposal_id: proposalId } = useParams<{ proposal_id?: string }>();

  const { data: snapshotId } = useSnapshotId({
    contractAddress: guildAddress,
    proposalId,
  });

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
    snapshotId: snapshotId?.toString(),
  });

  // Return response based on implementation type
  if (isSnapshotGuild) return totalLockedAtProposalSnapshotResponse;
  if (isRepGuild) return totalLockedResponse; // TODO: replace with rep implementation totalLocked call
  if (isSnapshotRepGuild) return totalLockedResponse; // TODO: replace with rep implementation totalLocked call
  return totalLockedResponse;
};

export default useTotalLocked;
