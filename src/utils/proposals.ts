import { bnum } from './helpers';
import moment from 'moment';

export const decodeProposalStatus = function(
  proposal, proposalStateChangeEvents, votingMachineParams, maxSecondsForExecution
) {
  const timeNow = bnum(moment().unix());
  const queuedVotePeriodLimit = votingMachineParams.queuedVotePeriodLimit;
  const boostedVotePeriodLimit = votingMachineParams.boostedVotePeriodLimit;
  const preBoostedVotePeriodLimit = votingMachineParams.preBoostedVotePeriodLimit;
  const quietEndingPeriod = votingMachineParams.quietEndingPeriod;
  const boostedPhaseTime = proposal.boostedPhaseTime;
  const submittedTime = proposal.submittedTime;
  const preBoostedPhaseTime = proposal.preBoostedPhaseTime;

  // TODO: take in count that gen voting machine dont boost automatically
   
  switch (proposal.stateInVotingMachine) {
    case "1":
      return { 
        status: "Expired in Queue", 
        boostTime: bnum(0), 
        finishTime: submittedTime.plus(queuedVotePeriodLimit)
      };
    case "2":
      if (proposal.stateInScheme == "2")
        return { 
          status: "Proposal Rejected", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp)
        };
      else if (proposal.stateInScheme == "3")
        return { 
          status: "Execution Succeded", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp)
        };
      else if (proposal.stateInScheme == "4")
        return { 
          status: "Execution Timeout", 
          boostTime: boostedPhaseTime,
          finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp)
        };
      else return { 
        status: "Passed", 
        boostTime: boostedPhaseTime,
        finishTime: bnum(proposalStateChangeEvents.find(event => event.state == 2).timestamp)
      };
    case "3":
      if (timeNow > submittedTime.plus(queuedVotePeriodLimit).toNumber()) {
        return { 
          status: "Expired in Queue",
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit)
        };
      } else {
        return { 
          status: "In Queue",
          boostTime: bnum(0),
          finishTime: submittedTime.plus(queuedVotePeriodLimit)
        };
      }
    case "4":
      if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).plus(maxSecondsForExecution).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Execution Timeout",
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit)
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Execution", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit)
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Boost", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit)
        };
      } else if (timeNow > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber() && proposal.shouldBoost) {
        return { 
          status: "Pending Execution",
          boostTime: boostedPhaseTime,
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit)
        };
      } else {
        return { 
          status: "Pre Boosted", 
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit)
        };
      }
    case "5":
      if (timeNow > boostedPhaseTime.plus(boostedVotePeriodLimit).toNumber()) {
        return { 
          status: "Pending Execution", 
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit)
        };
      } else {
        return { 
          status: "Boosted", 
          boostTime: boostedPhaseTime,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit)
        };
      }
    case "6":
      return { 
        status: "Quiet Ending Period", 
        boostTime: boostedPhaseTime,
        finishTime: boostedPhaseTime.plus(quietEndingPeriod)
      };
  }
}
