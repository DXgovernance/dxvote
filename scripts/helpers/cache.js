const _ = require("lodash");
const { BigNumber } = require('bignumber.js');

BigNumber.config({
  EXPONENTIAL_AT: [-100, 100],
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  DECIMAL_PLACES: 18,
});

const MAX_BLOCKS_PER_EVENTS_FETCH = process.env.MAX_BLOCKS_PER_EVENTS_FETCH || 100000;

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
  return _.orderBy( _.uniqBy(events, "id") , ["logIndex", "transactionIndex", "blockNumber"], ["desc","desc","desc"]);
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

module.exports = { getEventsBetweenBlocks, sortEvents, decodeSchemeParameters };
