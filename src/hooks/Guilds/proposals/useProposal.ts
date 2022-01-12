import { useEffect, useState } from 'react';
import { Proposal } from '../../../types/types.guilds';
import { mapStructToProposal } from '../../../utils/guildsProposals';
import { useERC20Guild } from '../contracts/useContract';

export interface useProposalReturns {
  proposal: Proposal;
  error: null | Error;
  loading: boolean;
}

export const useProposal = (
  contractAddress: string,
  proposalId: string
): useProposalReturns => {
  const [proposal, setProposal] = useState<Proposal>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contract = useERC20Guild(contractAddress);

  useEffect(() => {
    try {
      contract.getProposal(proposalId).then(data => {
        const proposal = mapStructToProposal(data, proposalId);
        setProposal(proposal);
      });
    } catch (e) {
      setError(e);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [contract, proposalId]);

  return {
    proposal,
    loading,
    error,
  };
};
