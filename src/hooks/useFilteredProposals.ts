import { useEffect, useMemo } from 'react';
import { ProposalsExtended } from '../contexts/proposals';
import { useFilterCriteria } from './useFilterCriteria';
import useMiniSearch from './useMiniSearch';
import useQueryStringValue from './useQueryStringValue';

const matchStatus = (proposal: ProposalsExtended, status: string) =>
  status === 'Any Status' || !status
    ? proposal
    : parseInt(proposal.stateInVotingMachine as any) === parseInt(status);

const matchScheme = (proposal: ProposalsExtended, scheme: string) =>
  scheme === 'All Schemes' || !scheme ? proposal : proposal.scheme === scheme;

export const useFilteredProposals = () => {
  const { proposals, loading } = useFilterCriteria();
  console.log(proposals, loading);

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
  const [titleFilter, setTitleFilter] = useQueryStringValue('title', '');
  const [stateFilter, setStateFilter] = useQueryStringValue(
    'status',
    'Any Status'
  );
  const [schemesFilter, setSchemesFilter] = useQueryStringValue(
    'scheme',
    'All Schemes'
  );

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
