import useEtherSWR from 'ether-swr';
import { BigNumber } from 'utils';
import { SWRResponse } from 'swr';

interface UseVotingPowerProps {
  contractAddress: string;
}

type UseVotingPowerForProposalExecutionHook = (
  args: UseVotingPowerProps
) => SWRResponse<BigNumber>;

/**
 * Get minimum amount of votingPower needed for proposal execution
 */
export const useVotingPowerForProposalExecution: UseVotingPowerForProposalExecutionHook =
  ({ contractAddress }) =>
    useEtherSWR([contractAddress, 'getVotingPowerForProposalExecution']);
