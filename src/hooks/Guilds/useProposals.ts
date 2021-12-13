import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { BigNumber } from 'ethers/utils';
import { useEffect, useState } from 'react';
import { ERC20Guild__factory } from '../../types/factories/ERC20Guild__factory';

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

export const useProposals = (
  contractAddress: string): useProposalsReturns => {
  const [proposals, setProposals] = useState<GuildsProposal[]>([]);
  const [proposalIds, setProposalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { library } = useWeb3React();
  const provider = new Web3Provider(library.currentProvider);

  const ERC20_GUILD_INSTANCE = ERC20Guild__factory.connect(
    contractAddress,
    provider
  );

  useEffect(() => {
    if (!library) return null
    setLoading(true);
    const getProposals = async () => {
      const proposals = await Promise.all(
        proposalIds.map(id => ERC20_GUILD_INSTANCE.getProposal(id))
      );
      return setProposals(proposals);
    };

    try {
      getProposals();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, library]);

  useEffect(() => {
    if (!library) return null
    setLoading(true);
    const getProposalIds = async () => {
      const ids = await ERC20_GUILD_INSTANCE.getProposalsIds();
      return setProposalIds(ids);
    };

    try {
      getProposalIds();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [contractAddress, provider]);

  return {
    proposals,
    loading,
    error,
  };
};
