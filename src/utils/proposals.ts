import {
  bnum,
  WalletSchemeProposalState,
  VotingMachineProposalState,
} from './index';
import moment from 'moment';

import { PendingAction,BigNumber } from '../utils';

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

export const getProposalMutableData = function (
  networkCache: DaoNetworkCache,
  proposalId: string
): {
  votes: {
    [decision: number]: BigNumber
  },
  stakes: {
    [decision: number]: BigNumber
  },
  stateInVotingMachine: VotingMachineProposalState,
  preBoostTimestamp: BigNumber,
  boostTimestamp: BigNumber,
  finishTimestamp: BigNumber
} {
  const proposal = networkCache.proposals[proposalId];
  const scheme = networkCache.schemes[proposal.scheme];
  const votingMachineOfProposal = scheme.votingMachine;
  const votingMachineEvents = networkCache.votingMachines[votingMachineOfProposal].events;
  let proposalMutableData = {
    votes : {},
    stakes: {},
    stateInVotingMachine: 0,
    preBoostTimestamp: bnum(0),
    boostTimestamp: bnum(0),
    finishTimestamp: bnum(0)
  };

  votingMachineEvents.votes.map(voteEvent => {
    if (!proposalMutableData.votes[voteEvent.vote])
      proposalMutableData.votes[voteEvent.vote] = bnum(voteEvent.amount);
    else 
      proposalMutableData.votes[voteEvent.vote] = proposalMutableData.votes[voteEvent.vote]
        .plus(voteEvent.amount);
  });
  votingMachineEvents.stakes.map(stake => {
    if (!proposalMutableData.stakes[stake.vote])
      proposalMutableData.stakes[stake.vote] = bnum(stake.amount);
    else 
      proposalMutableData.stakes[stake.vote] = proposalMutableData.stakes[stake.vote]
        .plus(stake.amount);
  });

  const proposalStatus = decodeProposalStatus(
    proposal,
    votingMachineEvents.proposalStateChanges,
    proposal.paramsHash ===
      '0x0000000000000000000000000000000000000000000000000000000000000000'
        ? networkCache.votingMachines[votingMachineOfProposal]
            .votingParameters[scheme.paramsHash]
        : networkCache.votingMachines[votingMachineOfProposal]
            .votingParameters[proposal.paramsHash],
    scheme.maxSecondsForExecution,
    false,
    scheme.type
  );

  proposalMutableData.preBoostTimestamp = bnum(
    votingMachineEvents.proposalStateChanges
      .find((votingMachineEvent) => votingMachineEvent.proposalId == proposalId 
        && Number(votingMachineEvent.state) == VotingMachineProposalState.PreBoosted
      ).timestamp
      || "0"
  );
  proposalMutableData.boostTimestamp = proposalStatus.boostTime;
  proposalMutableData.finishTimestamp = proposalStatus.finishTime;
  proposalMutableData.stateInVotingMachine = VotingMachineProposalState[
    votingMachineEvents.proposalStateChanges
      .filter((votingMachineEvent) => votingMachineEvent.proposalId == proposalId).at(-1).state
  ];

  return proposalMutableData;
};

// @ts-ignore
export const decodeProposalStatus = function (
  proposal,
  proposalStateChangeEvents,
  votingMachineParams,
  maxSecondsForExecution,
  autoBoost,
  schemeType
): {
  status: string,
  boostTime: BigNumber,
  finishTime: BigNumber,
  pendingAction: PendingAction
} {
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
        pendingAction: PendingAction.None,
      };
    case VotingMachineProposalState.Executed:
      if (
        proposal.stateInScheme === WalletSchemeProposalState.Rejected &&
        schemeType === 'ContributionReward'
      )
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
          pendingAction: PendingAction.Redeem,
        };
      else if (proposal.stateInScheme === WalletSchemeProposalState.Rejected)
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
          pendingAction:
            schemeType === 'ContributionReward' &&
            proposal.stateInVotingMachine < 3
              ? PendingAction.Redeem
              : PendingAction.None,
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
          pendingAction: PendingAction.None,
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
          pendingAction: PendingAction.None,
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
              ? PendingAction.Redeem
              : schemeType === 'GenericMulticall'
              ? 5
              : PendingAction.RedeemForBeneficiary,
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
          pendingAction: PendingAction.None,
        };
    case VotingMachineProposalState.Queued:
      if (timeNow > submittedTime.plus(queuedVotePeriodLimit).toNumber()) {
        return {
          status: 'Expired in Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: PendingAction.Finish,
        };
      } else {
        return {
          status: 'In Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: PendingAction.None,
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
          pendingAction: PendingAction.Finish,
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
          pendingAction: PendingAction.Execute,
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
          pendingAction: PendingAction.Boost,
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
          pendingAction: PendingAction.Execute,
        };
      } else if (
        timeNow > submittedTime.plus(queuedVotePeriodLimit) &&
        !proposal.shouldBoost
      ) {
        return {
          status: 'Pending Execution',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: PendingAction.Execute,
        };
      } else if (
        timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit) &&
        !proposal.shouldBoost
      ) {
        return {
          status: 'In Queue',
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: PendingAction.None,
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
          pendingAction: PendingAction.None,
        };
      }
    case VotingMachineProposalState.Boosted:
      if (timeNow > boostedPhaseTime.plus(boostedVotePeriodLimit).toNumber()) {
        return {
          status: 'Pending Execution',
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: PendingAction.Execute,
        };
      } else {
        return {
          status: 'Boosted',
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: PendingAction.None,
        };
      }
    // VotingMachineProposalState.QuietEndingPeriod
    default:
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
        pendingAction: finishTime.lt(timeNow)
          ? PendingAction.Finish
          : PendingAction.None,
      };
  }
};
