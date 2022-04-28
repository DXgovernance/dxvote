import { useTransactions } from 'contexts/Guilds/transactions';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import moment from 'moment';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ProposalState } from 'types/types.guilds';
import { useProposal } from './useProposal';

interface useProposalStateReturns {
  isExecutable: boolean;
  proposalState: ProposalState;
  executeProposal: void;
    error: Error
}

function useProposalState(): useProposalStateReturns {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal, error } = useProposal(guildId, proposalId);
  const { createTransaction } = useTransactions();
  const guildContract = useERC20Guild(guildId);

  const { isExecutable, proposalState, executeProposal } = useMemo(() => {
    const now = moment.unix(moment.now());
    const executeProposal = createTransaction('Execute Proposal', async () => {
      return guildContract.endProposal(proposalId);
    });

    return {
      proposalState: proposal.state,
      isExecutable:
        proposalState == ProposalState.Active && proposal.endTime < now
          ? true
          : false,
      executeProposal: executeProposal,
    };
  }, [proposal]);

  return { isExecutable, proposalState, error, executeProposal };
}

export default useProposalState;
