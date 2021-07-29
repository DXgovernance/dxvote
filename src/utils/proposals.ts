import { bnum } from './helpers';
import moment from 'moment';
import { BigNumber } from 'bignumber.js';

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

export const decodeProposalStatus = function(
  proposal, proposalStateChangeEvents, votingMachineParams, maxSecondsForExecution, autoBoost
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
    case "1":
      return { 
        status: "Expired in Queue", 
        boostTime: bnum(0), 
        finishTime: submittedTime.plus(queuedVotePeriodLimit),
        pendingAction: 0
      };
    case "2":
      if (proposal.stateInScheme == "2")
        return { 
          status: "Proposal Rejected", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp),
          pendingAction: 0
        };
      else if (proposal.stateInScheme == "3")
        return { 
          status: "Execution Succeded", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp),
          pendingAction: 0
        };
      else if (proposal.stateInScheme == "4")
        return { 
          status: "Execution Timeout", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp),
          pendingAction: 0
        };
      else return { 
        status: "Passed", 
        boostTime: boostedPhaseTime,
        finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp),
        pendingAction: 0
      };
    case "3":
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
    case "4":
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
          pendingAction: 2
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
    case "5":
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
    case "6":
      return { 
        status: "Quiet Ending Period", 
        boostTime: boostedPhaseTime,
        finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 6).timestamp).plus(quietEndingPeriod),
        pendingAction: 2
      };
  }
}
