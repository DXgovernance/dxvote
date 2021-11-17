import { useEffect, useMemo, useState } from 'react';
import { ProposalsExtended } from '../contexts/proposals';
import useMiniSearch from './useMiniSearch';
import { useProposals } from './useProposals';

export const useFilteredProposals = () => {
  const [{ proposals, loading }] = useProposals();
  const minisearch = useMiniSearch<ProposalsExtended>({
    fields: ['title'],
    storeFields: ['id'],
    searchOptions: {
      fuzzy: 0.3,
      prefix: true,
      combineWith: 'AND',
    },
  });

  // Filtering criteria
  const [titleFilter, setTitleFilter] = useState('');

  // Rebuild search index when proposals list changes
  useEffect(() => {
    minisearch.buildIndex(proposals);
  }, [proposals]);

  // Compute search results when search criteria changes
  const searchResults = useMemo(() => {
    let filteredProposals = titleFilter
      ? minisearch.query(titleFilter)
      : proposals;

    console.log({ filteredProposals });
    return filteredProposals;
  }, [proposals, titleFilter]);

  return { proposals: searchResults, loading, titleFilter, setTitleFilter };
};
