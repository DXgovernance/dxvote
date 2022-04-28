import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import useGuildImplementationTypeConfig from 'hooks/Guilds/guild/useGuildImplementationType';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';

interface UseSnapshotIdProps {
  contractAddress: string;
  proposalId: string;
}

type UseSnapshotIdHook = (args: UseSnapshotIdProps) => SWRResponse<BigNumber>;

const useSnapshotId: UseSnapshotIdHook = ({ contractAddress, proposalId }) => {
  const { isSnapshotGuild } = useGuildImplementationTypeConfig(contractAddress);
  return useEtherSWR(
    isSnapshotGuild && proposalId && contractAddress
      ? [contractAddress, 'getProposalSnapshotId', proposalId]
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useSnapshotId;
