import {
  bnum,
  WalletSchemeProposalState,
  VotingMachineProposalState,
  ZERO_ADDRESS,
} from './index';
import moment from 'moment';

import DaoStore from 'stores/DaoStore';
//import { ZERO_ADDRESS } from 'utils';
import { ProposalsExtended } from 'contexts/proposals';

// constant used to the initial order of the proposals (Any Status).
export const QUEUED_PRIORITY_THRESHOLD = 10;

export const isExpired = (proposal: Proposal): boolean => {
  return (
    proposal.stateInVotingMachine === VotingMachineProposalState.ExpiredInQueue
  );
};

// Checks for whether vote was made before boosting activated
// Returns false if proposal was not boosted at all
export const votedBeforeBoosted = (proposal: Proposal, vote: Vote): boolean => {
  const boosted = proposal.boostedPhaseTime.toNumber() > 0;
  const votedBeforeBoosted =
    vote.timestamp < proposal.boostedPhaseTime.toNumber();
  const notBoosted = proposal.boostedPhaseTime.toNumber() === 0;
  return (boosted && votedBeforeBoosted) || notBoosted;
};

export const isNotActive = (proposal: Proposal): boolean => {
  return proposal.stateInVotingMachine < 3;
};

export const hasLostReputation = (
  voteParameters: VotingMachineParameters
): boolean => {
  return voteParameters.votersReputationLossRatio.toNumber() > 0;
};

export const isWinningVote = (
  proposal: Proposal,
  vote: Vote | Stake
): boolean => {
  return proposal.winningVote === vote.vote;
};
export const calculateStakes = function (
  thresholdConst,
  boostedProposals,
  preBoostedProposals,
  upstakes,
  downstakes
) {
  // No idea why but the estimation of staking token by diving the thresholdConst get on chain by 0.90...
  // I think it might be due to the precision magic used in the real number library used in teh GenensisProtocol
  thresholdConst = thresholdConst.times(0.90949470177);
  let threshold = thresholdConst.div(10 ** 12).pow(boostedProposals);
  if (threshold.lt(1.0001)) threshold = bnum('1.0001');

  let recommendedThreshold = thresholdConst
    .div(10 ** 12)
    .pow(Number(boostedProposals) + Number(preBoostedProposals));
  if (recommendedThreshold.lt(1.0001)) recommendedThreshold = bnum('1.0001');

  return {
    stakeToBoost: downstakes.times(threshold).minus(upstakes),
    stakeToUnBoost: upstakes.div(threshold).minus(downstakes),
    recommendedStakeToBoost: downstakes
      .times(recommendedThreshold)
      .minus(upstakes),
    recommendedStakeToUnBoost: upstakes
      .div(recommendedThreshold)
      .minus(downstakes),
  };
};
// @ts-ignore
export const decodeProposalStatus = function (
  proposal,
  proposalStateChangeEvents,
  votingMachineParams,
  maxSecondsForExecution,
  autoBoost,
  schemeType
) {
  const timeNow = bnum(moment().unix());
  const queuedVotePeriodLimit = votingMachineParams.queuedVotePeriodLimit;
  const boostedVotePeriodLimit = votingMachineParams.boostedVotePeriodLimit;
  const preBoostedVotePeriodLimit =
    votingMachineParams.preBoostedVotePeriodLimit;
  const quietEndingPeriod = votingMachineParams.quietEndingPeriod;
  const boostedPhaseTime = proposal.boostedPhaseTime;
  const submittedTime = proposal.submittedTime;
  const preBoostedPhaseTime = proposal.preBoostedPhaseTime;

  switch (proposal.stateInVotingMachine) {
    case VotingMachineProposalState.ExpiredInQueue:
      return {
        status: 'Expired in Queue',
        boostTime: bnum(0),
        finishTime: proposalStateChangeEvents.find(
          event =>
            Number(event.state) === VotingMachineProposalState.ExpiredInQueue
        )
          ? bnum(
              proposalStateChangeEvents.find(
                event =>
                  Number(event.state) ===
                  VotingMachineProposalState.ExpiredInQueue
              ).timestamp
            )
          : bnum(0),
        pendingAction: 0,
      };
    case VotingMachineProposalState.Executed:
      if (proposal.stateInScheme === WalletSchemeProposalState.Rejected)
        return {
          status: 'Proposal Rejected',
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(
            event => Number(event.state) === VotingMachineProposalState.Executed
          )
            ? bnum(
                proposalStateChangeEvents.find(
                  event =>
                    Number(event.state) === VotingMachineProposalState.Executed
                ).timestamp
              )
            : bnum(0),
          pendingAction: 0,
        };
      else if (
        proposal.stateInScheme === WalletSchemeProposalState.ExecutionSucceded
      )
        return {
          status: 'Execution Succeeded',
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(
            event => Number(event.state) === VotingMachineProposalState.Executed
          )
            ? bnum(
                proposalStateChangeEvents.find(
                  event =>
                    Number(event.state) === VotingMachineProposalState.Executed
                ).timestamp
              )
            : bnum(0),
          pendingAction: 0,
        };
      else if (
        proposal.stateInScheme === WalletSchemeProposalState.ExecutionTimeout
      )
        return {
          status: 'Execution Timeout',
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(
            event => Number(event.state) === VotingMachineProposalState.Executed
          )
            ? bnum(
                proposalStateChangeEvents.find(
                  event =>
                    Number(event.state) === VotingMachineProposalState.Executed
                ).timestamp
              )
            : bnum(0),
          pendingAction: 0,
        };
      else if (proposal.stateInScheme === WalletSchemeProposalState.Submitted)
        return {
          status: 'Passed',
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(
            event => Number(event.state) === VotingMachineProposalState.Executed
          )
            ? bnum(
                proposalStateChangeEvents.find(
                  event =>
                    Number(event.state) === VotingMachineProposalState.Executed
                ).timestamp
              )
            : bnum(0),
          pendingAction:
            schemeType === 'ContributionReward'
              ? 4
              : schemeType === 'GenericMulticall'
              ? 5
              : 0,
        };
      else
        return {
          status: 'Passed',
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(
            event => Number(event.state) === VotingMachineProposalState.Executed
          )
            ? bnum(
                proposalStateChangeEvents.find(
                  event =>
                    Number(event.state) === VotingMachineProposalState.Executed
                ).timestamp
              )
            : bnum(0),
          pendingAction: 0,
        };
    case VotingMachineProposalState.Queued:
      if (timeNow > submittedTime.plus(queuedVotePeriodLimit).toNumber()) {
        return {
          status: 'Expired in Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 3,
        };
      } else {
        return {
          status: 'In Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 0,
        };
      }
    case VotingMachineProposalState.PreBoosted:
      if (
        timeNow >
          preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit)
            .plus(maxSecondsForExecution)
            .toNumber() &&
        proposal.shouldBoost
      ) {
        return {
          status: 'Execution Timeout',
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit),
          pendingAction: 3,
        };
      } else if (
        timeNow >
          preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit)
            .toNumber() &&
        proposal.shouldBoost
      ) {
        return {
          status: 'Pending Execution',
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit),
          pendingAction: 2,
        };
      } else if (
        timeNow >
          preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).toNumber() &&
        proposal.shouldBoost
      ) {
        return {
          status: 'Pending Boost',
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: autoBoost
            ? preBoostedPhaseTime
                .plus(preBoostedVotePeriodLimit)
                .plus(boostedVotePeriodLimit)
            : timeNow.plus(boostedVotePeriodLimit),
          pendingAction: 1,
        };
      } else if (
        autoBoost &&
        timeNow >
          preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit)
            .toNumber() &&
        proposal.shouldBoost
      ) {
        return {
          status: 'Pending Execution',
          boostTime: boostedPhaseTime,
          finishTime: preBoostedPhaseTime
            .plus(preBoostedVotePeriodLimit)
            .plus(boostedVotePeriodLimit),
          pendingAction: 2,
        };
      } else if (
        timeNow > submittedTime.plus(queuedVotePeriodLimit) &&
        !proposal.shouldBoost
      ) {
        return {
          status: 'Pending Execution',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 2,
        };
      } else if (
        timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit) &&
        !proposal.shouldBoost
      ) {
        return {
          status: 'In Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 0,
        };
      } else {
        return {
          status: 'Pre Boosted',
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: autoBoost
            ? preBoostedPhaseTime
                .plus(preBoostedVotePeriodLimit)
                .plus(boostedVotePeriodLimit)
            : timeNow.plus(boostedVotePeriodLimit),
          pendingAction: 0,
        };
      }
    case VotingMachineProposalState.Boosted:
      if (timeNow > boostedPhaseTime.plus(boostedVotePeriodLimit).toNumber()) {
        return {
          status: 'Pending Execution',
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: 2,
        };
      } else {
        return {
          status: 'Boosted',
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: 0,
        };
      }
    case VotingMachineProposalState.QuietEndingPeriod:
      const finishTime =
        bnum(
          proposalStateChangeEvents.find(
            event =>
              Number(event.state) ===
              VotingMachineProposalState.QuietEndingPeriod
          ).timestamp
        ).plus(quietEndingPeriod) || bnum(0);
      return {
        status: 'Quiet Ending Period',
        boostTime: boostedPhaseTime,
        finishTime: finishTime,
        pendingAction: finishTime.lt(timeNow) ? 3 : 0,
      };
  }
};

//a: Proposal, b: Proposal but boostTIme is not in Proposal interface.
//is it added in Cache?
export const orderByNewestTimeToFinish = (a: any, b: any) =>
  a.finishTime - b.finishTime;

/// filtering and sorting proposals for All States, All Schemas criteria
export const filterInitialCriteria = (
  proposals: ProposalsExtended[],
  daoStore: DaoStore
) => {
  // (QuitedEndingPeriod || Queded) && positiveVotes >= 10% (Ordered from time to finish, from lower to higher)
  let earliestAbove10 = proposals.filter((proposal: Proposal) => {
    const repAtCreation = daoStore.getRepAt(
      ZERO_ADDRESS,
      proposal.creationEvent.l1BlockNumber
    ).totalSupply;

    return (
      (proposal.stateInVotingMachine ===
        VotingMachineProposalState.QuietEndingPeriod ||
        proposal.stateInVotingMachine === VotingMachineProposalState.Queued) &&
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
        proposal.stateInVotingMachine === VotingMachineProposalState.Queued) &&
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
