import { useTransactions } from 'contexts/Guilds/transactions';
import { useERC20Guild } from 'hooks/Guilds/contracts/useContract';
import moment from 'moment';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProposal } from '../ether-swr/guild/useProposal';

enum ProposalState {
  Active = 'Active',
  Passed = 'Passed',
  Executed = 'Executed',
  Failed = 'Failed',
}

interface useProposalStateReturns {
  data: {
    isExecutable: boolean;
    executeProposal: () => void;
  };
  error: Error;
  loading: boolean;
}

function useProposalState(): useProposalStateReturns {
  const { guild_id: guildId, proposal_id: proposalId } =
    useParams<{ guild_id?: string; proposal_id?: string }>();
  const { data: proposal, error } = useProposal(guildId, proposalId);
  const { createTransaction } = useTransactions();
  const guildContract = useERC20Guild(guildId);

  const executeProposal = () =>
    createTransaction('Execute Proposal', async () => {
      return guildContract.endProposal(proposalId);
    });

  const { data, loading } = useMemo(() => {
    if (!proposal) return { ...data, loading: true, error: error};
    const now = moment.unix(moment.now());

    return {
      data: {
        isExecutable:
        proposal.state == ProposalState.Active && proposal.endTime.isBefore(now),
        executeProposal: executeProposal,
      },
      loading: false,
      error: error,
    };
  }, [proposal]);

  return { data, error, loading };
}

export default useProposalState;
