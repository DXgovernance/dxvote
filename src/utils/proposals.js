import { bnum } from './helpers';
import moment from 'moment';

export const decodeStatus = function(
  stateInVotingMachine,
  stateInScheme,
  submittedTime,
  boostedPhaseTime,
  preBoostedPhaseTime,
  queuedVotePeriodLimit,
  boostedVotePeriodLimit,
  quietEndingPeriod,
  preBoostedVotePeriodLimit,
  shouldBoost
) {
  switch (stateInVotingMachine) {
    case "1":
      return { 
        status: "Expired in Queue", 
        priority: 1, 
        boostTime: 0, 
        finishTime: 0
      };
    break;
    case "2":
      if (stateInScheme == "3")
        return { 
          status: "Execution Failed", 
          priority: 2,
          boostTime: 0,
          finishTime: 0
        };
      else if (stateInScheme == "2")
        return { 
          status: "Execution Succeded", 
          priority: 2,
          boostTime: 0,
          finishTime: 0
        };
      else return { 
        status: "Passed", 
        priority: 2,
        boostTime: 0,
        finishTime: 0
      };
    break;
    case "3":
      if (moment().unix() > submittedTime.plus(queuedVotePeriodLimit).toNumber()) {
        return { 
          status: "Expired in Queue",
          priority: 1,
          boostTime: 0,
          finishTime: submittedTime.plus(queuedVotePeriodLimit)
        };
      } else {
        return { 
          status: "In Queue", 
          priority: 3,
          boostTime: 0,
          finishTime: submittedTime.plus(queuedVotePeriodLimit)
        };
      }
    break;
    case "4":
      if (moment().unix() > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).toNumber() && shouldBoost) {
        return { 
          status: "Pending Boost", 
          priority: 5,
          boostTime: boostedPhaseTime,
          finishTime: bnum(moment().unix()).plus(boostedVotePeriodLimit)
        };
      } else if (moment().unix() > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber() && shouldBoost) {
        return { 
          status: "Expired in Queue", 
          priority: 1,
          boostTime: boostedPhaseTime,
          finishTime: bnum(moment().unix()).plus(boostedVotePeriodLimit)
        };
      } else {
        return { 
          status: "Pre Boosted", 
          priority: 4,
          boostTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit),
          finishTime: preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit), 
        };
      }
    break;
    case "5":
      if (moment().unix() > boostedPhaseTime.plus(boostedVotePeriodLimit).toNumber()) {
        return { 
          status: "Pending Execution", 
          priority: 6,
          boostTime: 0,
          finishTime: 0
        };
      } else {
        return { 
          status: "Boosted", 
          priority: 5,
          boostTime: 0,
          finishTime: boostedPhaseTime.plus(boostedVotePeriodLimit)
        };
      }
    break;
    case "6":
      return { 
        status: "Quiet Ending Period", 
        priority: 6,
        boostTime: 0,
        finishTime: boostedPhaseTime.plus(quietEndingPeriod)
      };
    break;
    default:
    return { 
      status: "", 
      priority: 0,
      boostTime: 0,
      finishTime: 0
    };
  }
}
