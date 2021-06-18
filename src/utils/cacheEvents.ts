const _ = require("lodash");

const MAX_BLOCKS_PER_EVENTS_FETCH : number = Number(process.env.MAX_BLOCKS_PER_EVENTS_FETCH) || 1000000;

export const getEvents = async function(
  contract, fromBlock, toBlock, eventsToGet, maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  let events = [], to = Math.min(fromBlock + maxBlocksPerFetch, toBlock), from = fromBlock;
  while (from < to) {
    console.debug(`Fetching events of ${contract._address} from blocks ${from} -> ${to}`);
    try {
      const eventsFetched = await contract.getPastEvents(eventsToGet, {fromBlock: from, toBlock: to});
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.debug('Lowering toBlock', (to - from) / 2, 'blocks');
      to = from + (to - from) / 2;
    }
  };
  return events;
};

export const getRawEvents = async function(
  web3, contractAddress, fromBlock, toBlock, topicsToGet, maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  let events = [], to = Math.min(fromBlock + maxBlocksPerFetch, toBlock), from = fromBlock;
  while (from < to) {
    console.debug(`Fetching logs of ${contractAddress} from blocks ${from} -> ${to}`);
    try {
      const eventsFetched = await web3.eth.getPastLogs({
        address: contractAddress,
        fromBlock: from,
        toBlock: to,
        topics: topicsToGet
      })
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.debug('Lowering toBlock', (to - from) / 2, 'blocks');
      to = from + (to - from) / 2;
    }
  };
  return events;
};

export const sortEvents = function(events) {
  return _.orderBy( events , ["blockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc"]);
};
