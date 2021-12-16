import { BigNumber } from 'ethers/utils';
import { useEffect, useState } from 'react';
import { useERC20Guild } from './contracts/useContract';

export interface useProposalsReturns {
  proposals: GuildsProposal[];
  error: null | Error;
  loading: boolean;
}

export interface GuildsProposal {
  creator: string;
  startTime: BigNumber;
  endTime: BigNumber;
  to: string[];
  data: string[];
  value: BigNumber[];
  totalActions: BigNumber;
  title: string;
  contentHash: string;
  state: number;
  totalVotes: BigNumber[];
}

export const useProposals = (contractAddress: string): useProposalsReturns => {
  const [proposals, setProposals] = useState<GuildsProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contract = useERC20Guild(contractAddress);

  useEffect(() => {
    // if (!contract);

    const getProposals = async () => {
      try {
        setLoading(true);
        const ids = await contract.getProposalsIds();
        const proposals = await Promise.all(
          ids.map(id => contract.getProposal(id))
        );
        setError(null);
        return setProposals(proposals);
      } catch (e) {
        setError(e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getProposals();
  }, [contractAddress, contract]);

  return {
    proposals,
    loading,
    error,
  };
};
