import useEtherSWR from 'ether-swr';
import { BigNumber } from 'utils';
import { SWRResponse } from 'swr';

interface UseVoterLockTimestampProps {
  contractAddress: string;
  userAddress: string;
}

type UseVoterLockTimestampHook = (
  args: UseVoterLockTimestampProps
) => SWRResponse<BigNumber>;

/**
 * Get the locked timestamp of a voter tokens
 * @param contractAddress address of the contract
 * @param userAddress address of the voter
 */
export const useVoterLockTimestamp: UseVoterLockTimestampHook = ({
  contractAddress,
  userAddress,
}) => useEtherSWR([contractAddress, 'getVoterLockTimestamp', userAddress]);
