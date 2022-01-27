import { useEffect, useMemo, useState } from 'react';
import { VotingMachineProposalState, WalletSchemeProposalState } from 'utils';
import { useFilterCriteria } from './useFilterCriteria';
import useMiniSearch from './useMiniSearch';
import useQueryStringValue from './useQueryStringValue';
import { useContext } from 'contexts';

import { ProposalsExtended } from '../types/types';
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
  const {
    context: { ensService },
  } = useContext();

  const { proposals, loading } = useFilterCriteria();

  const minisearch = useMiniSearch<ProposalsExtended>({
    fields: ['title', 'proposer'],
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

  const [ensAddress, setEnsAddress] = useState<string>(null);
  const [isEnsResolving, setIsEnsResolving] = useState<boolean>(false);
  useEffect(() => {
    if (titleFilter?.endsWith('.eth')) {
      setIsEnsResolving(true);
      ensService
        .resolveENSAddress(titleFilter)
        .then(setEnsAddress)
        .finally(() => setIsEnsResolving(false));
    } else {
      setEnsAddress(null);
      setIsEnsResolving(false);
    }
  }, [titleFilter, ensService]);

  // Rebuild search index when proposals list changes
  useEffect(() => {
    minisearch.buildIndex(proposals);
  }, [minisearch, proposals]);

  // Compute search results when search criteria changes
  const searchResults = useMemo(() => {
    if (!proposals) return [];

    let filteredProposals = proposals;
    if (titleFilter) {
      const searchTerms = [titleFilter];
      if (ensAddress) searchTerms.push(ensAddress);
      filteredProposals = minisearch.query({ queries: searchTerms });
    }

    return filteredProposals.filter(
      proposal =>
        matchStatus(proposal, stateFilter) &&
        matchScheme(proposal, schemesFilter)
    );
  }, [
    minisearch,
    proposals,
    titleFilter,
    stateFilter,
    schemesFilter,
    ensAddress,
  ]);

  return {
    proposals: searchResults,
    loading: loading || isEnsResolving,
    titleFilter,
    setTitleFilter,
    stateFilter,
    setStateFilter,
    schemesFilter,
    setSchemesFilter,
  };
};
