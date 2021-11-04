import { useState, useEffect } from 'react';
import { useProposals } from './useProposals';

interface UseSearchReturns {
  loading: boolean;
}

export const useSearch = (titleFilter: string): UseSearchReturns => {
  const [store, dispatch] = useProposals();
  console.log(store, dispatch);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    setLoading(false);
  }, [titleFilter]);
  return {
    loading,
  };
};
