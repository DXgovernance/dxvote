const hre = require("hardhat");
const _ = require("lodash");
const { BigNumber } = require('bignumber.js');
const moment = require('moment');

BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  DECIMAL_PLACES: 18,
});

const contractsFile = require('../../src/config/contracts.json');

const MAX_BLOCKS_PER_EVENTS_FETCH = process.env.MAX_BLOCKS_PER_EVENTS_FETCH || 100000;

const getConfig = function(network) {
  if (network === 'localhost') {
    return {
      avatar: process.env.REACT_APP_AVATAR_ADDRESS.replace(/["']/g, ""),
      controller: process.env.REACT_APP_CONTROLLER_ADDRESS.replace(/["']/g, ""),
      reputation: process.env.REACT_APP_REPUTATION_ADDRESS.replace(/["']/g, ""),
      votingMachine: process.env.REACT_APP_VOTING_MACHINE_ADDRESS.replace(/["']/g, ""),
      permissionRegistry: process.env.REACT_APP_PERMISSION_REGISTRY_ADDRESS.replace(/["']/g, ""),
      multicall: process.env.REACT_APP_MULTICALL_ADDRESS.replace(/["']/g, ""),
      fromBlock: 0
    }
  } else {
    return contractsFile[network];
  }
}


const getEventsBetweenBlocks = async function(contract, from, to) {
  let events = [];

  while ((to - from) > MAX_BLOCKS_PER_EVENTS_FETCH) {
    console.debug('Getting events between blocks', contract.address, to - MAX_BLOCKS_PER_EVENTS_FETCH, to);
    events = events.concat(
      await contract.getPastEvents('allEvents', {toBlock: to, fromBlock: (to - MAX_BLOCKS_PER_EVENTS_FETCH)})
    );
    to = to - MAX_BLOCKS_PER_EVENTS_FETCH;
  };
  
  console.debug('Getting events between blocks', contract.address, from, to, );
  return events.concat(
    await contract.getPastEvents('allEvents', {toBlock: to, fromBlock: from })
  );
};

const sortEvents = function(events) {
  return _.orderBy( _.uniqBy(events, "id") , ["blockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc"]);
};

const decodeSchemeParameters = function(rawParameters) {
  return {
      queuedVoteRequiredPercentage: BigNumber(rawParameters.queuedVoteRequiredPercentage.toString()),
      queuedVotePeriodLimit: BigNumber(rawParameters.queuedVotePeriodLimit.toString()),
      boostedVotePeriodLimit: BigNumber(rawParameters.boostedVotePeriodLimit.toString()),
      preBoostedVotePeriodLimit: BigNumber(rawParameters.preBoostedVotePeriodLimit.toString()),
      thresholdConst: BigNumber(rawParameters.thresholdConst.toString()),
      limitExponentValue: BigNumber(rawParameters.limitExponentValue.toString()),
      quietEndingPeriod: BigNumber(rawParameters.quietEndingPeriod.toString()),
      proposingRepReward: BigNumber(rawParameters.proposingRepReward.toString()),
      votersReputationLossRatio: BigNumber(rawParameters.votersReputationLossRatio.toString()),
      minimumDaoBounty: BigNumber(rawParameters.minimumDaoBounty.toString()),
      daoBountyConst: BigNumber(rawParameters.daoBountyConst.toString()),
      activationTime: BigNumber(rawParameters.activationTime.toString())
    };
}

const getBlockTimeStamp = async function(blockNumber) {
  return await hre.web3.eth.getBlock(blockNumber).timestamp;
}

const decodeStatus = function(
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
      } else if (moment().unix() > preBoostedPhaseTime.plus(preBoostedVotePeriodLimit).plus(boostedVotePeriodLimit).toNumber()) {
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


module.exports = {
  getEventsBetweenBlocks,
  sortEvents,
  decodeSchemeParameters,
  getBlockTimeStamp,
  decodeStatus,
  getConfig
};
