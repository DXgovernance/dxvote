import { ProposalsExtended } from 'contexts/proposals';
import { useState, useEffect } from 'react';
import {
  orderByNewestTimeToFinish,
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useProposals } from './useProposals';
import { useRep } from './useRep';

interface useFilterCriteriaReturns {
  filteredProposals: ProposalsExtended[];
  earliestAbove10: ProposalsExtended[];
  boosted: ProposalsExtended[];
  preBoosted: ProposalsExtended[];
  earliestUnder10: ProposalsExtended[];
  executed: ProposalsExtended[];
  loading: boolean
}

export const useFilterCriteria = (): useFilterCriteriaReturns => {
  const {proposals} = useProposals();


  const {getRep} = useRep(ZERO_ADDRESS)

  console.log(proposals)
  // states
  const [filteredProposals, setFilteredProposals] = useState(proposals);
  const [earliestAbove10, setEarliestAbove10] = useState([]);
  const [boosted, setBoosted] = useState([]);
  const [preBoosted, setPreBoosted] = useState([]);
  const [earliestUnder10, setEarliestUnder10] = useState([]);
  const [executed, setExecuted] = useState([]);
  const [loading, setLoading] = useState(false)




  useEffect(() => {
    setLoading(true)
    // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    setEarliestAbove10(
      proposals
        .filter((proposal) => {
          const repAtCreation = getRep(proposal.creationEvent.l1BlockNumber).totalSupply


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
          (proposal): Boolean =>
            proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
        )
        .sort(orderByNewestTimeToFinish)
    );

    setPreBoosted(
      proposals
        .filter(
          (proposal): Boolean =>
            proposal.stateInVotingMachine ===
            VotingMachineProposalState.PreBoosted
        )
        .sort(orderByNewestTimeToFinish)
    );

    // (QuitedEndingPeriod || Queded) && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    setEarliestUnder10(
      proposals
        .filter((proposal): Boolean => {
          const repAtCreation = getRep(proposal.creationEvent.l1BlockNumber).totalSupply

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
          (proposal): Boolean =>
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
    setLoading(false)
  }, [proposals]);

  return {
    filteredProposals,
    earliestAbove10,
    boosted,
    preBoosted,
    earliestUnder10,
    executed,
    loading
  };
};
