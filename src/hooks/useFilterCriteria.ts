import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import {
  orderByNewestTimeToFinish,
  QUEUED_PRIORITY_THRESHOLD,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from 'utils';
import { useRep } from './useRep';
import { ProposalsExtended } from '../types/types';

interface useFilterCriteriaReturns {
  proposals: ProposalsExtended[];
  earliestAbove10: ProposalsExtended[];
  boosted: ProposalsExtended[];
  preBoosted: ProposalsExtended[];
  earliestUnder10: ProposalsExtended[];
  executed: ProposalsExtended[];
  loading: boolean;
}

export const useFilterCriteria = (): useFilterCriteriaReturns => {
  const {
    context: { daoStore },
  } = useContext();

  const { getRep } = useRep(ZERO_ADDRESS);

  const [filteredProposals, setFilteredProposals] = useState<
    ProposalsExtended[]
  >([]);
  const [earliestAbove10, setEarliestAbove10] = useState([]);
  const [boosted, setBoosted] = useState([]);
  const [preBoosted, setPreBoosted] = useState([]);
  const [earliestUnder10, setEarliestUnder10] = useState([]);
  const [executed, setExecuted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestAbove10 = daoStore
      .getAllProposals()
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
    const stateBoosted = daoStore
      .getAllProposals()
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine === VotingMachineProposalState.Boosted
      )
      .sort(orderByNewestTimeToFinish);

    const statePreBoosted = daoStore
      .getAllProposals()
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine ===
          VotingMachineProposalState.PreBoosted
      )
      .sort(orderByNewestTimeToFinish);

    // (QuitedEndingPeriod || Queded) && positiveVotes < 10% (Ordered from time to finish, from lower to higher)
    const stateEarliestUnder10 = daoStore
      .getAllProposals()
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

    //Proposals in Executed status. (Ordered in time passed since finish, from lower to higher)
    const stateExecuted = daoStore
      .getAllProposals()
      .filter(
        (proposal): Boolean =>
          proposal.stateInVotingMachine === VotingMachineProposalState.Executed
      )
      .sort(orderByNewestTimeToFinish);

    setEarliestAbove10(stateEarliestAbove10);
    setEarliestUnder10(stateEarliestUnder10);
    setPreBoosted(statePreBoosted);
    setBoosted(statePreBoosted);
    setExecuted(stateExecuted);

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
    earliestAbove10,
    boosted,
    preBoosted,
    earliestUnder10,
    executed,
    loading,
  };
};
