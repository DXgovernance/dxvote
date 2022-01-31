import contentHash from 'content-hash';
import _ from 'lodash';

const Web3 = require('web3');
const web3 = new Web3();

const MAX_BLOCKS_PER_EVENTS_FETCH: number =
  Number(process.env.MAX_BLOCKS_PER_EVENTS_FETCH) || 100000;

export const getEvents = async function (
  web3,
  contract,
  fromBlock,
  toBlock,
  eventsToGet,
  maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  let events = [],
    to = Math.min(fromBlock + maxBlocksPerFetch, toBlock),
    from = fromBlock;
  while (from < to) {
    console.debug(
      `Fetching events of ${contract._address} from blocks ${from} -> ${to}`
    );
    try {
      let eventsFetched = await contract.getPastEvents(eventsToGet, {
        fromBlock: from,
        toBlock: to,
      });
      eventsFetched = await getTimestampOfEvents(web3, eventsFetched);
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.error('Error fetching blocks:', (error as Error).message);
      if (Math.trunc((to - from) / 2) > 10000) {
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
    }
  }
  return events;
};

export const getRawEvents = async function (
  web3,
  contractAddress,
  fromBlock,
  toBlock,
  topicsToGet,
  maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  let events = [],
    to = Math.min(fromBlock + maxBlocksPerFetch, toBlock),
    from = fromBlock;
  while (from < to) {
    console.debug(
      `Fetching logs of ${contractAddress} from blocks ${from} -> ${to}`
    );
    try {
      let eventsFetched = await web3.eth.getPastLogs({
        address: contractAddress,
        fromBlock: from,
        toBlock: to,
        topics: topicsToGet,
      });
      eventsFetched = await getTimestampOfEvents(web3, eventsFetched);
      events = events.concat(eventsFetched);
      from = to;
      to = Math.min(from + maxBlocksPerFetch, toBlock);
    } catch (error) {
      console.error('Error fetching blocks:', (error as Error).message);
      if (Math.trunc((to - from) / 2) > 10000) {
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
    }
  }
  return events;
};

export const getTimestampOfEvents = async function (web3, events) {
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
  events.map(event => {
    if (blocksToFetch.indexOf(event.blockNumber) < 0)
      blocksToFetch.push(event.blockNumber);
  });
  const totalLength = blocksToFetch.length;
  while (blocksToFetch.length > 0 && totalLength > timestamps.length) {
    // timestamps = (await batchRequest(blocksToFetch)).map((blockResult) => {
    //   return blockResult.timestamp;
    // });
    const blocksToFetchBatch = blocksToFetch.splice(0, 500);
    await Promise.all(
      blocksToFetchBatch.map(async block => {
        const blockInfo = await web3.eth.getBlock(block);
        for (let i = 0; i < events.length; i++) {
          if (events[i].blockNumber === blockInfo.number)
            events[i].timestamp = blockInfo.timestamp;
          if (blockInfo.l2BlockNumber)
            events[i].blockNumber = Number(blockInfo.l2BlockNumber);
        }
      })
    );
  }
  return events;
};

export const sortEvents = function (events) {
  return _.orderBy(
    events,
    ['blockNumber', 'transactionIndex', 'logIndex'],
    ['asc', 'asc', 'asc', 'asc']
  );
};

export const executeMulticall = async function (web3, multicall, calls) {
  const rawCalls = calls.map(call => {
    return [
      call[0]._address,
      web3.eth.abi.encodeFunctionCall(
        call[0]._jsonInterface.find(method => method.name === call[1]),
        call[2]
      ),
    ];
  });

  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData,
    decodedReturnData: returnData.map((callResult, i) => {
      return web3.eth.abi.decodeParameters(
        calls[i][0]._jsonInterface.find(method => method.name === calls[i][1])
          .outputs,
        callResult
      )['0'];
    }),
  };
};

export const executeRawMulticall = async function (multicall, calls) {
  const rawCalls = calls.map(call => {
    return [call[0], call[1]];
  });

  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData,
  };
};

export const isNode = function () {
  return typeof module !== 'undefined' && module.exports;
};

export const descriptionHashToIPFSHash = function (descriptionHash) {
  try {
    if (contentHash.getCodec(descriptionHash) === 'ipfs-ns')
      return contentHash.decode(descriptionHash);
    else if (
      descriptionHash.length > 1 &&
      descriptionHash.substring(0, 2) !== 'Qm'
    )
      return descriptionHash;
    else return '';
  } catch (error) {
    return '';
  }
};

export const ipfsHashToDescriptionHash = function (ipfsHash) {
  try {
    if (ipfsHash.length > 1 && ipfsHash.substring(0, 2) === 'Qm')
      return contentHash.fromIpfs(ipfsHash);
    else if (contentHash.getCodec(ipfsHash) === 'ipfs-ns') return ipfsHash;
    else return '';
  } catch (error) {
    return '';
  }
};

export const getSchemeConfig = function (networkContracts, schemeAddress) {  
  if (networkContracts?.daostack[schemeAddress])
    return {
      type: networkContracts.daostack[schemeAddress].type,
      name: networkContracts.daostack[schemeAddress].name,
      contractToCall: networkContracts.daostack[schemeAddress].contractToCall,
      newProposalTopics: networkContracts.daostack[schemeAddress].newProposalTopics,
      creationLogEncoding: networkContracts.daostack[schemeAddress].creationLogEncoding,
      votingMachine: networkContracts.daostack[schemeAddress].votingMachine,
      voteParams: networkContracts.daostack[schemeAddress].voteParams,
    }
  else 
    return {
      type: 'WalletScheme',
      name: 'WalletScheme',
      contractToCall: schemeAddress,
      newProposalTopics: [
        [
          web3.utils.soliditySha3('ProposalStateChange(bytes32,uint256)'),
          null,
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      ],
      creationLogEncoding: [],
    };
};

export async function tryCacheUpdates(promises, networkCache) {
  let retry = true;
  while (retry) {
    try {
      (await Promise.all(promises)).map(networkCacheUpdated => {
        networkCache = networkCacheUpdated;
      });
    } catch (e) {
      console.error('[CACHE UPDATE] (trying again)', e.message);
    } finally {
      retry = false;
    }
  }
  return networkCache;
}