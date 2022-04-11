import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
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
  return useEtherSWR(
    contractAddress ? [contractAddress, 'getCurrentSnapshotId'] : [],
    {
      ABIs: new Map([[contractAddress, SnapshotERC20Guild.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useCurrentSnapshotId;
