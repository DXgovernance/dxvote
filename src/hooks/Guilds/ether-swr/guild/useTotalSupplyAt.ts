import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import ERC20SnapshotRep from 'contracts/ERC20SnapshotRep.json';

interface UseTotalSupplyAtProps {
  contractAddress: string;
  snapshotId: string;
}

type UseTotalSupplyAtHook = (
  args: UseTotalSupplyAtProps
) => SWRResponse<BigNumber>;

/**
 * Get the total supply amount at snapshot
 */
const useTotalSupplyAt: UseTotalSupplyAtHook = ({
  contractAddress, // tokenAddress,
  snapshotId,
}) => {
  return useEtherSWR(
    snapshotId && contractAddress
      ? [contractAddress, 'totalSupplyAt', snapshotId]
      : [],
    {
      ABIs: new Map([[contractAddress, ERC20SnapshotRep.abi]]),
      refreshInterval: 0,
    }
  );
};

export default useTotalSupplyAt;
