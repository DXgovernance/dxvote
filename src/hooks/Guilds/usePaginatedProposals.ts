import { useEffect, useState, useCallback } from 'react';
import { useERC20Guild } from './contracts/useContract';
import { GuildsProposal } from './useProposals';

export interface usePaginatedProposalsReturns {
  proposals: GuildsProposal[];
  error: null | Error;
  loading: boolean;
  pagesCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export const usePaginatedProposals = (
  contractAddress: string,
  itemsPerPage: number = 1,
  currentPage: number = 1
): usePaginatedProposalsReturns => {
  const [proposals, setProposals] = useState<GuildsProposal[]>([]);
  const [_internalProposalsList, _setInternalProposalList] = useState<{}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ids, setIds] = useState<string[]>([]);
  const [availablePages, setAvailablePages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const contract = useERC20Guild(contractAddress);

  const getCurrentIds = useCallback(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return ids.slice(start, end);
  }, [currentPage, itemsPerPage, ids]);

  useEffect(() => {
    if (!contract) return;
    const getIds = async () => {
      try {
        setLoading(true);
        const ids = await contract.getProposalsIds();
        setAvailablePages(Math.ceil(ids.length / itemsPerPage));
        setError(null);
        setIds(ids);
      } catch (e) {
        setError(e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getIds();
  }, [contract, itemsPerPage]);

  useEffect(() => {
    if (!contract) return;
    const getProposals = async () => {
      if (!ids.length) return;
      try {
        setLoading(true);
        const searchIds = getCurrentIds();
        if (_internalProposalsList[currentPage]) {
          setProposals(_internalProposalsList[currentPage]);
        } else {
          const result = await Promise.all(
            searchIds.map(id => contract.getProposal(id))
          );
          setProposals(result);
          _setInternalProposalList(prev => ({
            ...prev,
            [currentPage]: result,
          }));
        }
        setError(null);
      } catch (e) {
        setError(e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getProposals();
  }, [contract, ids, getCurrentIds, _internalProposalsList, currentPage]);

  useEffect(() => {
    setHasNextPage(currentPage < availablePages);
    setHasPrevPage(currentPage > 1);
  }, [currentPage, availablePages]);

  return {
    proposals,
    loading,
    error,
    pagesCount: availablePages,
    hasPrevPage,
    hasNextPage,
  };
};
