import { useEffect, useMemo, useState } from 'react';
import { ProposalsExtended } from '../contexts/proposals';
import useMiniSearch from './useMiniSearch';
import { useProposals } from './useProposals';

const matchStatus = (proposal: ProposalsExtended, status: string) =>
  status === 'Any Status' || !status
    ? proposal
    : parseInt(proposal.stateInVotingMachine as any) === parseInt(status);

const matchScheme = (proposal: ProposalsExtended, scheme: string) =>
  scheme === 'All Schemes' || !scheme ? proposal : proposal.scheme === scheme;

export const useFilteredProposals = () => {
  const { proposals, loading } = useProposals();
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
  const [stateFilter, setStateFilter] = useState('Any Status');
  const [schemesFilter, setSchemesFilter] = useState('All Schemes');

  // Rebuild search index when proposals list changes
  useEffect(() => {
    minisearch.buildIndex(proposals);
  }, [proposals]);

  // Compute search results when search criteria changes
  const searchResults = useMemo(() => {
    if (!proposals) return [];

    let filteredProposals = titleFilter
      ? minisearch.query(titleFilter)
      : proposals;

    console.log(stateFilter, schemesFilter);

    filteredProposals = filteredProposals.filter(
      proposal =>
        matchStatus(proposal, stateFilter) &&
        matchScheme(proposal, schemesFilter)
    );
    return filteredProposals;
  }, [minisearch, proposals, titleFilter, stateFilter, schemesFilter]);

  return {
    proposals: searchResults,
    loading,
    titleFilter,
    setTitleFilter,
    stateFilter,
    setStateFilter,
    schemesFilter,
    setSchemesFilter,
  };
};
