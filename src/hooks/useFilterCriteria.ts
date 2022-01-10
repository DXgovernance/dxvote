import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import {
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useRep } from './useRep';
import { ProposalsExtended } from '../types/types';

interface useFilterCriteriaReturns {
  proposals: ProposalsExtended[];
  loading: boolean;
}

export const orderByNewestTimeToFinish = (
  a: ProposalsExtended,
  b: ProposalsExtended
) => a.finishTime - b.finishTime;

export const orderByOldestTimeToFinish = (
  a: ProposalsExtended,
  b: ProposalsExtended
) => b.finishTime - a.finishTime;

export const useFilterCriteria = (): useFilterCriteriaReturns => {
  const {
    context: { daoStore },
  } = useContext();

  const { getRep } = useRep(ZERO_ADDRESS);

  const [filteredProposals, setFilteredProposals] = useState<
    ProposalsExtended[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allProposals = daoStore.getAllProposals();
    // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestAbove10 = allProposals
      .filter(proposal => {
        const repAtCreation = getRep(
          proposal.creationEvent.blockNumber
        ).totalSupply;

        return (
          (proposal.stateInVotingMachine ===
            VotingMachineProposalState.QuietEndingPeriod ||
            proposal.stateInVotingMachine ===
              VotingMachineProposalState.Queued) &&
          proposal.positiveVotes
            .div(repAtCreation)
            .times(100)
            .decimalPlaces(2)
            .gte(QUEUED_PRIORITY_THRESHOLD)
        );
      })
      .sort(orderByNewestTimeToFinish);

    // Proposals Boosted. (Ordered from time to finish, from lower to higher)
    const stateBoosted = allProposals
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
      )
      .sort(orderByNewestTimeToFinish);

    const statePreBoosted = allProposals
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine ===
          VotingMachineProposalState.PreBoosted
      )
      .sort(orderByNewestTimeToFinish);

    // (QuitedEndingPeriod || Queded) && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestUnder10 = allProposals
      .filter((proposal): Boolean => {
        const repAtCreation = getRep(
          proposal.creationEvent.blockNumber
        ).totalSupply;

        return (
          (proposal.stateInVotingMachine ===
            VotingMachineProposalState.QuietEndingPeriod ||
            proposal.stateInVotingMachine ===
              VotingMachineProposalState.Queued) &&
          proposal.positiveVotes
            .div(repAtCreation)
            .times(100)
            .decimalPlaces(2)
            .lt(QUEUED_PRIORITY_THRESHOLD)
        );
      })
      .sort(orderByNewestTimeToFinish);

    //Proposals in Executed status. (Ordered in time passed since finish, from higher to lower)
    const stateExecuted = allProposals
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine === VotingMachineProposalState.Executed
      )
      .sort(orderByOldestTimeToFinish);

    setFilteredProposals([
      ...stateEarliestAbove10,
      ...stateBoosted,
      ...statePreBoosted,
      ...stateEarliestUnder10,
      ...stateExecuted,
    ]);

    setLoading(false);
  }, []);

  return {
    proposals: filteredProposals,
    loading,
  };
};
