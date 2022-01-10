import { useEffect, useState } from 'react';
import { useERC20Guild } from './contracts/useContract';
import { Proposal } from '../../types/types.guilds';

export interface useProposalsReturns {
  proposals: Proposal[];
  error: null | Error;
  loading: boolean;
}

export const useProposals = (contractAddress: string): useProposalsReturns => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contract = useERC20Guild(contractAddress);

  useEffect(() => {
    if (!contract) return;

    const getProposals = async () => {
      try {
        setLoading(true);
        const ids = await contract.getProposalsIds();
        const proposals = await Promise.all(
          ids.map(id => contract.getProposal(id))
        );
        setError(null);
        setProposals(proposals);
      } catch (e) {
        setError(e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getProposals();
  }, [contract]);

  return {
    proposals,
    loading,
    error,
  };
};
