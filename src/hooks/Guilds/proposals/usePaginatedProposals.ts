import { useEffect, useState, useCallback } from 'react';
import { Proposal } from '../../../types/types.guilds';
import { useProposalsContext } from '../../../contexts/Guilds';
import { useGuildConfig } from '../useGuildConfig';

export interface usePaginatedProposalsReturns {
  proposals: Proposal[];
  error: null | Error;
  loading: boolean;
  pagesCount: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export const usePaginatedProposals = (
  currentPage: number = 1,
  itemsPerPage: number = 5
): usePaginatedProposalsReturns => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [availablePages, setAvailablePages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);
  const { contract } = useGuildConfig();
  const context = useProposalsContext();

  const getCurrentPageIds = useCallback(() => {
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
      setLoading(true);
      try {
        const searchIds = getCurrentPageIds();
        const result = await context.getProposals(contract, searchIds);
        setProposals(result);
        setError(null);
      } catch (e) {
        setError(e);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getProposals();
  }, [contract, ids, getCurrentPageIds, currentPage, context]);

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
