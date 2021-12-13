import { useEffect, useMemo } from 'react';
import { VotingMachineProposalState, WalletSchemeProposalState } from 'utils';
import { ProposalsExtended } from '../contexts/proposals';
import { useFilterCriteria } from './useFilterCriteria';
import useMiniSearch from './useMiniSearch';
import useQueryStringValue from './useQueryStringValue';

const matchStatus = (proposal: ProposalsExtended, status: string) => {
  if (status === 'Any Status' || !status) {
    return proposal;
  }
  // status is rejected
  if (status === '7') {
    return proposal.stateInScheme === WalletSchemeProposalState.Rejected;
  }
  // status is passed
  if (status === '8') {
    return (
      proposal.stateInScheme === WalletSchemeProposalState.Submitted &&
      proposal.stateInVotingMachine === VotingMachineProposalState.Executed
    );
  }
  return proposal.stateInVotingMachine === parseInt(status);
};

const matchScheme = (proposal: ProposalsExtended, scheme: string) => {
  if (scheme === 'All Schemes' || !scheme) {
    return proposal;
  }
  return proposal.scheme === scheme;
};

export const useFilteredProposals = () => {
  const { proposals, loading } = useFilterCriteria();

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
