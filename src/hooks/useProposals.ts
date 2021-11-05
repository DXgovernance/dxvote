import { useState, useEffect } from 'react';
import {
  orderByNewestTimeToFinish,
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useContext } from '../contexts';

export type ProposalsExtended = Proposal &
  ProposalStateChange &
  VotingMachineParameters &
  Pick<Scheme, 'maxSecondsForExecution' | 'type'> & {
    autoBoost: Boolean;
  };

interface useProposalsReturns {
  proposals: ProposalsExtended[];
  filterInitialCriteria: (
    proposals: ProposalsExtended[]
  ) => ProposalsExtended[];
}

// @todo each instance of the hook should have its own filtering and search functions
// @todo all processing of proposals happens here

export const useProposals = (): useProposalsReturns => {
  const {
    context: { daoStore },
  } = useContext();

  const [proposals, setProposals] = useState<ProposalsExtended[]>([]);

  const allProposals: ProposalsExtended[] = daoStore
    .getAllProposals()
    .map(cacheProposal => {
      return Object.assign(
        cacheProposal,
        daoStore.getProposalStatus(cacheProposal.id)
      );
    });

  /// filtering and sorting proposals for All States, All Schemas criteria
  const filterInitialCriteria = (proposals: ProposalsExtended[]) => {
    // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    let earliestAbove10 = proposals.filter((proposal: Proposal) => {
      const repAtCreation = daoStore.getRepAt(
        ZERO_ADDRESS,
        proposal.creationEvent.l1BlockNumber
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
    });
    earliestAbove10.sort(orderByNewestTimeToFinish);

    // Proposals Boosted. (Ordered from time to finish, from lower to higher)
    let boosted = proposals.filter(
      (proposal: Proposal): Boolean =>
        proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
    );
    boosted.sort(orderByNewestTimeToFinish);

    let preBoosted = proposals.filter(
      (proposal: Proposal): Boolean =>
        proposal.stateInVotingMachine === VotingMachineProposalState.PreBoosted
    );
    preBoosted.sort(orderByNewestTimeToFinish);

    // (QuitedEndingPeriod || Queded) && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    let earliestUnder10 = proposals.filter((proposal: Proposal): Boolean => {
      const repAtCreation = daoStore.getRepAt(
        ZERO_ADDRESS,
        proposal.creationEvent.l1BlockNumber
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
    });
    earliestUnder10.sort(orderByNewestTimeToFinish);

    //Proposals in Executed status. (Ordered in time passed since finish, from lower to higher)
    let executed = proposals.filter(
      (proposal: Proposal): Boolean =>
        proposal.stateInVotingMachine === VotingMachineProposalState.Executed
    );
    executed.sort(orderByNewestTimeToFinish);

    return [
      ...earliestAbove10,
      ...boosted,
      ...preBoosted,
      ...earliestUnder10,
      ...executed,
    ];
  };

  useEffect(() => {
    setProposals(allProposals); //triggers reindex
  }, []);

  return {
    proposals,
    filterInitialCriteria,
  };
};
