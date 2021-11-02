import { useState, useEffect, useRef } from 'react';
import MiniSearch from 'minisearch';
import { ProposalsExtended } from './useProposals';

interface UseSearchReturns {
  sortedProposals: ProposalsExtended[];
  loading: boolean;
}

export const useSearch = (proposals: ProposalsExtended[]): UseSearchReturns => {
  const [sortedProposals, setSortedProposals] = useState<ProposalsExtended[]>(
    []
  );
  const [titleFilter, setTitleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const miniSearchRef = useRef(
    new MiniSearch({
      fields: ['title'],
      storeFields: ['id'],
      searchOptions: {
        fuzzy: 0.3,
        prefix: true,
        combineWith: 'AND',
      },
    })
  );
  const miniSearch = miniSearchRef.current;
  useEffect(() => {
    setLoading(true);
    miniSearch.removeAll();
    miniSearch.addAll(proposals);

    if (titleFilter) {
      const search = miniSearch.search(titleFilter);
      proposals = proposals.filter(proposal =>
        search.find(elem => elem.id === proposal.id)
      );
      setSortedProposals(proposals);
    }

    setLoading(false);
  }, [titleFilter]);
  return {
    sortedProposals,
    loading,
  };
};
