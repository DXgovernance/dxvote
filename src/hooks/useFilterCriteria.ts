import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import {
  bnum,
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useRep } from './useRep';
import { ProposalsExtended } from '../types/types';
import moment from 'moment';

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
  const timeNow = bnum(moment().unix());

  useEffect(() => {
    const allProposals = daoStore.getAllProposals();

    // Queded && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestAbove10 = allProposals
      .filter(proposal => {
        const queuedVotePeriodLimit =
          daoStore.getCache().votingMachines[
            daoStore.getCache().schemes[proposal.scheme].votingMachine
          ].votingParameters[proposal.paramsHash].queuedVotePeriodLimit;

        const repAtCreation = getRep(
          proposal.creationEvent.blockNumber
        ).totalSupply;

        return (
          proposal.stateInVotingMachine === VotingMachineProposalState.Queued &&
          timeNow.lt(proposal.submittedTime.plus(queuedVotePeriodLimit)) &&
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

    const stateQuiteEndingProposals = allProposals
      .filter(proposal => {
        return (
          proposal.stateInVotingMachine ===
          VotingMachineProposalState.QuietEndingPeriod
        );
      })
      .sort(orderByNewestTimeToFinish);

    const statePreBoosted = allProposals
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine ===
          VotingMachineProposalState.PreBoosted
      )
      .sort(orderByNewestTimeToFinish);

    // Queded && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestUnder10 = allProposals
      .filter((proposal): Boolean => {
        const queuedVotePeriodLimit =
          daoStore.getCache().votingMachines[
            daoStore.getCache().schemes[proposal.scheme].votingMachine
          ].votingParameters[proposal.paramsHash].queuedVotePeriodLimit;

        const repAtCreation = getRep(
          proposal.creationEvent.blockNumber
        ).totalSupply;

        return (
          proposal.stateInVotingMachine === VotingMachineProposalState.Queued &&
          timeNow.lt(proposal.submittedTime.plus(queuedVotePeriodLimit)) &&
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

    //Proposals finished status. (Expired in queue, rejected or passed)
    const stateFinished = allProposals
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine ===
            VotingMachineProposalState.ExpiredInQueue ||
          proposal.stateInVotingMachine ===
            VotingMachineProposalState.Rejected ||
          proposal.stateInVotingMachine === VotingMachineProposalState.Passed
      )
      .sort(orderByOldestTimeToFinish);

    setFilteredProposals([
      ...stateBoosted,
      ...statePreBoosted,
      ...stateQuiteEndingProposals,
      ...stateEarliestAbove10,
      ...stateEarliestUnder10,
      ...stateExecuted,
      ...stateFinished,
    ]);

    setLoading(false);
  }, []);

  return {
    proposals: filteredProposals,
    loading,
  };
};
