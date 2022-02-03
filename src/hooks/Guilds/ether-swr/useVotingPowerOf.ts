import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from './useEtherSWR';

interface UseVotingPowerOfProps {
  contractAddress: string;
  userAddress: string;
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
}) => useEtherSWR([contractAddress, 'votingPowerOf', userAddress]);
