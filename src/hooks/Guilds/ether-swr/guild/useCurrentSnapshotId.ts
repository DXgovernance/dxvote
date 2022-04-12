import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import useGuildImplementationTypeConfig from 'hooks/Guilds/guild/useGuildImplementationType';
import SnapshotERC20Guild from 'contracts/SnapshotERC20Guild.json';

interface UseCurrentSnapshotIdProps {
  contractAddress: string;
}

type UseCurrentSnapshotIdHook = (
  args: UseCurrentSnapshotIdProps
) => SWRResponse<BigNumber>;

const useCurrentSnapshotId: UseCurrentSnapshotIdHook = ({
  contractAddress,
}) => {
  const { isSnapshotGuild } = useGuildImplementationTypeConfig(contractAddress);
  return useEtherSWR(
    isSnapshotGuild && contractAddress
      ? [contractAddress, 'getCurrentSnapshotId']
      : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useCurrentSnapshotId;
