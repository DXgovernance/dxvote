import { useTransactions } from 'contexts/Guilds/transactions';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import moment from 'moment';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProposal } from './useProposal';



 enum ProposalState {
  Active = "Active",
  Passed = "Passed",
  Executed = "Executed",
  Failed = "Failed",
}

interface useProposalStateReturns {
  isExecutable: boolean;
  executeProposal: () => void;
    error: Error
}

function useProposalState(): useProposalStateReturns {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal, error } = useProposal(guildId, proposalId);
  const { createTransaction } = useTransactions();
  const guildContract = useERC20Guild(guildId);

  const { isExecutable, executeProposal } = useMemo(() => {
    const now = moment.unix(moment.now());
    const executeProposal = () => createTransaction('Execute Proposal', async () => {
      return guildContract.endProposal(proposalId);
    });


    return {
      isExecutable:
        proposal.state == ProposalState.Active && proposal.endTime < now
          ? true
          : false,
      executeProposal: executeProposal,
    };
  }, [proposal]);

  return { isExecutable, error, executeProposal };
}

export default useProposalState;
