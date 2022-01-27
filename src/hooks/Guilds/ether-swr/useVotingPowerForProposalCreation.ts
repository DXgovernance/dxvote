import useEtherSWR from 'ether-swr';
import { BigNumber } from 'utils';
import { SWRResponse } from 'swr';

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
