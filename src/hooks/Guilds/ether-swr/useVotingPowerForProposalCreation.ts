import { BigNumber } from 'utils';
import { SWRResponse } from 'swr';
import useEtherSWR from './useEtherSWR';

interface UseVotingPowerProps {
  contractAddress: string;
}

type UseVotingPowerForProposalCreationHook = (
  args: UseVotingPowerProps
) => SWRResponse<BigNumber>;

/**
 * Get minimum amount of votingPower needed for creation
 */
export const useVotingPowerForProposalCreation: UseVotingPowerForProposalCreationHook =
  ({ contractAddress }) =>
    useEtherSWR([contractAddress, 'getVotingPowerForProposalCreation']);
