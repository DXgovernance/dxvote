import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import {
  orderByNewestTimeToFinish,
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useProposals } from './useProposals';

interface useFilterCriteriaReturns {
  filteredProposals: Proposal[];
  earliestAbove10: Proposal[];
  boosted: Proposal[];
  preBoosted: Proposal[];
  earliestUnder10: Proposal[];
  executed: Proposal[];
}

export const useFilterCriteria = (): useFilterCriteriaReturns => {
  const { proposals } = useProposals();
  const {
    context: { daoStore },
  } = useContext();

  // states
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [earliestAbove10, setEarliestAbove10] = useState([]);
  const [boosted, setBoosted] = useState([]);
  const [preBoosted, setPreBoosted] = useState([]);
  const [earliestUnder10, setEarliestUnder10] = useState([]);
  const [executed, setExecuted] = useState([]);

  useEffect(() => {
    // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    setEarliestAbove10(
      proposals
        .filter((proposal: Proposal) => {
          // useMemo here
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
        })
        .sort(orderByNewestTimeToFinish)
    );

    // Proposals Boosted. (Ordered from time to finish, from lower to higher)
    setBoosted(
      proposals
        .filter(
          (proposal: Proposal): Boolean =>
            proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
        )
        .sort(orderByNewestTimeToFinish)
    );

    setPreBoosted(
      proposals
        .filter(
          (proposal: Proposal): Boolean =>
            proposal.stateInVotingMachine ===
            VotingMachineProposalState.PreBoosted
        )
        .sort(orderByNewestTimeToFinish)
    );

    // (QuitedEndingPeriod || Queded) && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    setEarliestUnder10(
      proposals
        .filter((proposal: Proposal): Boolean => {
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
        })
        .sort(orderByNewestTimeToFinish)
    );

    //Proposals in Executed status. (Ordered in time passed since finish, from lower to higher)
    setExecuted(
      proposals
        .filter(
          (proposal: Proposal): Boolean =>
            proposal.stateInVotingMachine ===
            VotingMachineProposalState.Executed
        )
        .sort(orderByNewestTimeToFinish)
    );

    setFilteredProposals([
      ...earliestAbove10,
      ...boosted,
      ...preBoosted,
      ...earliestUnder10,
      ...executed,
    ]);
  }, [proposals]);

  return {
    filteredProposals,
    earliestAbove10,
    boosted,
    preBoosted,
    earliestUnder10,
    executed,
  };
};
