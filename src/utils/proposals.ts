import { bnum, WalletSchemeProposalState, VotingMachineProposalState } from './index';
import moment from 'moment';

export const calculateStakes = function(thresholdConst, boostedProposals, preBoostedProposals, upstakes, downstakes ) {

  // No idea why but the estimation of staking token by diving the thresholdConst get on chain by 0.90...
  // I think it might be due to the precision magic used in the real number library used in teh GenensisProtocol
  thresholdConst = thresholdConst.times(0.90949470177);
  let threshold = thresholdConst.div(10**12).pow(boostedProposals);
  if (threshold.lt(1.0001))
    threshold = bnum("1.0001");
    
  let recommendedThreshold = thresholdConst.div(10**12).pow(Number(boostedProposals) + Number(preBoostedProposals));
  if (recommendedThreshold.lt(1.0001))
    recommendedThreshold = bnum("1.0001");
  
  return {
    stakeToBoost: downstakes.times(threshold).minus(upstakes),
    stakeToUnBoost: upstakes.div(threshold).minus(downstakes),
    recommendedStakeToBoost: downstakes.times(recommendedThreshold).minus(upstakes),
    recommendedStakeToUnBoost: upstakes.div(recommendedThreshold).minus(downstakes)
  }

}
// @ts-ignore
export const decodeProposalStatus = function(
  proposal, proposalStateChangeEvents, votingMachineParams, maxSecondsForExecution, autoBoost, schemeType
) {
  const timeNow = bnum(moment().unix());
  const queuedVotePeriodLimit = votingMachineParams.queuedVotePeriodLimit;
  const boostedVotePeriodLimit = votingMachineParams.boostedVotePeriodLimit;
  const preBoostedVotePeriodLimit = votingMachineParams.preBoostedVotePeriodLimit;
  const quietEndingPeriod = votingMachineParams.quietEndingPeriod;
  const boostedPhaseTime = proposal.boostedPhaseTime;
  const submittedTime = proposal.submittedTime;
  const preBoostedPhaseTime = proposal.preBoostedPhaseTime;

  switch (proposal.stateInVotingMachine) {
    case VotingMachineProposalState.ExpiredInQueue:
      return { 
        status: "Expired in Queue", 
        boostTime: bnum(0), 
        finishTime: submittedTime.plus(queuedVotePeriodLimit),
        pendingAction: 0
      };
    case VotingMachineProposalState.Executed:
      if (proposal.stateInScheme == WalletSchemeProposalState.Rejected)
        return { 
          status: "Proposal Rejected", 
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed)
          ? bnum(
            proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed).timestamp
          ) : bnum(0),
          pendingAction: 0
        };
      else if (proposal.stateInScheme == WalletSchemeProposalState.ExecutionSucceded)
        return { 
          status: "Execution Succeeded", 
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed)
          ? bnum(
            proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed).timestamp
          ) : bnum(0),
          pendingAction: 0
        };
      else if (proposal.stateInScheme == WalletSchemeProposalState.ExecutionTimeout)
        return { 
          status: "Execution Timeout", 
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed) 
          ? bnum(
            proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed).timestamp
          ) : bnum(0),
          pendingAction: 0
        };
      else if (proposal.stateInScheme == WalletSchemeProposalState.Submitted)
        return {
          status: "Passed", 
          boostTime: boostedPhaseTime,
          finishTime: proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed)
          ? bnum(
            proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed).timestamp
          ) : bnum(0),
          pendingAction: schemeType == "ContributionReward" ? 4 : schemeType == "GenericMulticall" ? 5 : 0
        };
      else return { 
        status: "Passed", 
        boostTime: boostedPhaseTime,
        finishTime: proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed)
        ? bnum(
          proposalStateChangeEvents.find(event => event.state == VotingMachineProposalState.Executed).timestamp
        ) : bnum(0),
        pendingAction: 0
      };
    case VotingMachineProposalState.Queued:
      if (timeNow > submittedTime.plus(queuedVotePeriodLimit).toNumber()) {
        return { 
          status: "Expired in Queue",
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 3
        };
      } else {
        return { 
          status: "In Queue",
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 0
        };
      }
    case VotingMachineProposalState.PreBoosted:
      if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).plus(maxSecondsForExecution).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Execution Timeout",
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit),
          pendingAction: 3
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Execution", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit),
          pendingAction: 0
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Boost", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit),
          pendingAction: 1
        };
      } else if (autoBoost && timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Execution",
          boostTime: boostedPhaseTime,
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit),
          pendingAction: 2
        };
      } else if (timeNow > submittedTime.plus(queuedVotePeriodLimit) && !proposal.shouldBoost) {
        return { 
          status: "Pending Execution", 
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 2
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit) && !proposal.shouldBoost) {
        return { 
          status: "In Queue", 
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit),
          pendingAction: 0
        };
      } else {
        return { 
          status: "Pre Boosted", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit),
          pendingAction: 0
        };
      }
    case VotingMachineProposalState.Boosted:
      if (timeNow > boostedPhaseTime.plus(boostedVotePeriodLimit).toNumber()) {
        return { 
          status: "Pending Execution", 
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: 2
        };
      } else {
        return { 
          status: "Boosted", 
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit),
          pendingAction: 0
        };
      }
    case VotingMachineProposalState.QuietEndingPeriod:
      return { 
        status: "Quiet Ending Period", 
        boostTime: boostedPhaseTime,
        finishTime: proposalStateChangeEvents .find(event => event.state == VotingMachineProposalState.QuietEndingPeriod)
        ? bnum(
          proposalStateChangeEvents .find(event => event.state == VotingMachineProposalState.QuietEndingPeriod).timestamp
        ).plus(quietEndingPeriod)
        : bnum(0),
        pendingAction: 0
      };
  }
}
