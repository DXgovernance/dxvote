const hre = require("hardhat");
const _ = require("lodash");

const MAX_BLOCKS_PER_EVENTS_FETCH : number = Number(process.env.MAX_BLOCKS_PER_EVENTS_FETCH) || 100000;

export const getEventsBetweenBlocks = async function(contract, from, to) {
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

export const sortEvents = function(events) {
  return _.orderBy( _.uniqBy(events, "id") , ["blockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc"]);
};

export const getBlockTimeStamp = async function(blockNumber) {
  return await hre.web3.eth.getBlock(blockNumber).timestamp;
}
