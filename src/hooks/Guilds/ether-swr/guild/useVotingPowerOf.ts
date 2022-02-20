import { BigNumber } from 'ethers';
import { SWRResponse } from 'swr';
import useEtherSWR from '../useEtherSWR';
import ERC20GuildContract from 'contracts/ERC20Guild.json';

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
}) =>
  useEtherSWR(
    contractAddress && userAddress
      ? [contractAddress, 'votingPowerOf', userAddress]
      : [],
    {
      ABIs: new Map([[contractAddress, ERC20GuildContract.abi]]),
    }
  );
