const _ = require("lodash");

const MAX_BLOCKS_PER_EVENTS_FETCH : number = Number(process.env.MAX_BLOCKS_PER_EVENTS_FETCH) || 1000000;

export const getEvents = async function(
  web3, contract, fromBlock, toBlock, eventsToGet, maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  let events = [], to = Math.min(fromBlock + maxBlocksPerFetch, toBlock), from = fromBlock;
  while (from < to) {
    console.debug(`Fetching events of ${contract._address} from blocks ${from} -> ${to}`);
    try {
      let eventsFetched = await contract.getPastEvents(eventsToGet, {fromBlock: from, toBlock: to});
      eventsFetched = await getTimestampOfEvents(web3, eventsFetched);
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.error('Error fetching blocks:',error.message);
      if (Math.trunc( ((to - from) / 2) ) > 100000) {
        const blocksToLower = Math.max(Math.trunc( ((to - from) / 2) ), 100000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
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
      let eventsFetched = await web3.eth.getPastLogs({
        address: contractAddress,
        fromBlock: from,
        toBlock: to,
        topics: topicsToGet
      });
      eventsFetched = await getTimestampOfEvents(web3, eventsFetched);
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.error('Error fetching blocks:',error.message)
      if (Math.trunc( ((to - from) / 2) ) > 100000) {
        const blocksToLower = Math.max(Math.trunc( ((to - from) / 2) ), 100000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
    }
  };
  return events;
};

export const getTimestampOfEvents = async function(web3, events) {
  
  //// TODO:  See how can we bacth requests can be implemented
  
  // async function batchRequest(blocks) {
  //   const batch = new web3.BatchRequest();
  //   let requests = [];
  //   for (let i = 0; i < blocks.length; i++) {
  //     const request = new Promise((resolve, reject) => {
  //       batch.add(web3.eth.getBlock.request(blocks[i], (err, data) => {
  //         console.log(1)
  //         if (err) return reject(err);
  //         resolve(data);
  //       }));
  //     });
  //     requests.push(request);
  //   }
  //   batch.execute();
  //   console.log(batch)
  //   await Promise.all(requests);
  //   return batch;
  // };

  let blocksToFetch = [];
  let timestamps = [];
  events.map((event) => {
    if (blocksToFetch.indexOf(event.blockNumber) < 0)
      blocksToFetch.push(event.blockNumber);
  })
  const totalLength = blocksToFetch.length;
  while (blocksToFetch.length > 0 && totalLength > timestamps.length){
    // timestamps = (await batchRequest(blocksToFetch)).map((blockResult) => {
    //   return blockResult.timestamp;
    // });
    const blocksToFetchBatch = blocksToFetch.splice(0, 500)
    await Promise.all(blocksToFetchBatch.map(async (block) => {
      const blockInfo = (await web3.eth.getBlock(block));
      for (let i = 0; i < events.length; i++) {
        if (events[i].blockNumber == blockInfo.number)
          events[i].timestamp = blockInfo.timestamp;
        if (blockInfo.l1BlockNumber)
          events[i].l1BlockNumber = Number(blockInfo.l1BlockNumber);
      }
    }));
  }

  for (let i = 0; i < events.length; i++) {
    if (events[i].l1BlockNumber){
      events[i].l2BlockNumber = events[i].blockNumber;
    } else {
      events[i].l1BlockNumber = events[i].blockNumber;
      events[i].l2BlockNumber = 0;
    }
  }
  return events;
};

export const sortEvents = function(events) {
  return _.orderBy( events , ["l1BlockNumber", "l2BlockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc"]);
};
