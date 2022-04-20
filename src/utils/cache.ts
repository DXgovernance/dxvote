import { Contract } from 'ethers';
import _ from 'lodash';
import { MAX_BLOCKS_PER_EVENTS_FETCH } from './constants';
import { sleep } from './helpers';

const Web3 = require('web3');
const web3 = new Web3();

const arbitrum = require('../configs/arbitrum/config.json');
const arbitrumTestnet = require('../configs/arbitrumTestnet/config.json');
const mainnet = require('../configs/mainnet/config.json');
const xdai = require('../configs/xdai/config.json');
const rinkeby = require('../configs/rinkeby/config.json');
const localhost = require('../configs/localhost/config.json');

const proposalTitles = require('../configs/proposalTitles.json');

const defaultConfigHashes = require('../configs/default.json');

export const getDefaultConfigHashes = (): Record<string, string> => {
  return defaultConfigHashes;
};

export const getProposalTitles = (): Record<string, string> => {
  return proposalTitles;
};

export const getAppConfig = (): AppConfig => {
  return {
    arbitrum,
    arbitrumTestnet,
    mainnet,
    xdai,
    rinkeby,
    localhost,
  };
};

// Sort cache data, so the IPFS hash is consistent
export const sortNetworkCache = (
  networkCache: DaoNetworkCache
): DaoNetworkCache => {
  Object.keys(networkCache.schemes).forEach(schemeId => {
    networkCache.schemes[schemeId].proposalIds.sort();
    networkCache.schemes[schemeId].newProposalEvents.sort((a, b) =>
      a.proposalId.localeCompare(b.proposalId)
    );
  });
  networkCache.proposals = Object.keys(networkCache.proposals)
    .sort()
    .reduce((obj, key) => {
      obj[key] = networkCache.proposals[key];
      return obj;
    }, {});
  networkCache.ipfsHashes = _.uniqBy(networkCache.ipfsHashes, 'name');
  networkCache.ipfsHashes.sort((a, b) => a.name.localeCompare(b.name));

  return networkCache;
};

export const getEvents = async function (
  web3,
  contract,
  fromBlock,
  toBlock,
  eventsToGet,
  maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  if (web3._provider.host && web3._provider.host.indexOf('arbitrum.io/rpc') > 0)
    maxBlocksPerFetch = 99000;
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
      if ((error as Error).message.indexOf('Relay attempts exhausted') > -1) {
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.error('Relay attempts exhausted');
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
        await sleep(5000);
      } else if (
        (error as Error).message.indexOf(
          'You cannot query logs for more than 100000 blocks at once.'
        ) > -1
      ) {
        maxBlocksPerFetch = Number((maxBlocksPerFetch / 4).toFixed(0));
        to = from + 100000;
        console.error(
          'You cannot query logs for more than 100000 blocks at once.'
        );
        console.debug('Lowering toBlock to', to);
      } else if (
        (error as Error).message.indexOf('Relay attempts exhausted') === -1 &&
        Math.trunc((to - from) / 2) > 10000
      ) {
        console.error('Error fetching blocks:', (error as Error).message);
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
    }
  }
  return sortEvents(events);
};

export const getRawEvents = async function (
  web3,
  contractAddress,
  fromBlock,
  toBlock,
  topicsToGet,
  maxBlocksPerFetch = MAX_BLOCKS_PER_EVENTS_FETCH
) {
  if (web3._provider.host && web3._provider.host.indexOf('arbitrum.io/rpc') > 0)
    maxBlocksPerFetch = 99000;
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
      if ((error as Error).message.indexOf('Relay attempts exhausted') > -1) {
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.error('Relay attempts exhausted');
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
        await sleep(5000);
      } else if (
        (error as Error).message.indexOf(
          'You cannot query logs for more than 100000 blocks at once.'
        ) > -1
      ) {
        maxBlocksPerFetch = Number((maxBlocksPerFetch / 4).toFixed(0));
        to = from + 100000;
        console.error(
          'You cannot query logs for more than 100000 blocks at once.'
        );
        console.debug('Lowering toBlock to', to);
      } else if (
        (error as Error).message.indexOf('Relay attempts exhausted') === -1 &&
        Math.trunc((to - from) / 2) > 10000
      ) {
        console.error('Error fetching blocks:', (error as Error).message);
        const blocksToLower = Math.max(Math.trunc((to - from) / 2), 10000);
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        to = to - blocksToLower;
      }
    }
  }
  return sortEvents(events);
};

export const getTimestampOfEvents = async function (web3, events) {
  //// TODO:  See how can we batch requests can be implemented
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
  return _.uniq(
    _.orderBy(
      events,
      ['blockNumber', 'transactionIndex', 'logIndex'],
      ['asc', 'asc', 'asc', 'asc']
    )
  );
};

export const executeMulticall = async function (
  multicall: Contract,
  calls: any[]
) {
  const rawCalls = calls.map(call => {
    const functionParams = [...call[1].matchAll(/\(([^)]+)\)/g)]
      .flat()[1]
      ?.split(',');
    return [
      call[0],
      web3.eth.abi.encodeFunctionSignature(call[1]) +
        (functionParams
          ? web3.eth.abi.encodeParameters(functionParams, call[2]).substring(2)
          : ''),
    ];
  });
  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData,
    decodedReturnData: returnData.map((callResult, i) => {
      return calls[i][3].length > 0
        ? web3.eth.abi.decodeParameters(calls[i][3], callResult)
        : '';
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

export const getSchemeConfig = function (networkContracts, schemeAddress) {
  if (networkContracts.daostack && networkContracts.daostack[schemeAddress])
    return {
      type: networkContracts.daostack[schemeAddress].type,
      name: networkContracts.daostack[schemeAddress].name,
      contractToCall: networkContracts.daostack[schemeAddress].contractToCall,
      newProposalTopics:
        networkContracts.daostack[schemeAddress].newProposalTopics,
      creationLogEncoding:
        networkContracts.daostack[schemeAddress].creationLogEncoding,
      votingMachine: networkContracts.daostack[schemeAddress].votingMachine,
      voteParams: networkContracts.daostack[schemeAddress].voteParams,
    };
  else
    return {
      type: 'WalletScheme',
      name: 'WalletScheme',
      contractToCall: schemeAddress,
      newProposalTopics: [
        [
          Web3.utils.soliditySha3('ProposalStateChange(bytes32,uint256)'),
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
        networkCache = Object.assign(networkCache, networkCacheUpdated);
      });
    } catch (e) {
      console.error('[CACHE UPDATE] (trying again)');
      console.error(e);
    } finally {
      retry = false;
    }
  }
  return networkCache;
}

export async function batchPromisesOntarget(
  promises,
  targetObject,
  maxPromisesPerTry = 0,
  maxErrorsTry = 5
) {
  let promisesBatch = maxPromisesPerTry === 0 ? [promises] : [];
  let promisesBatchIndex = 0;
  let errorsTry = 0;

  if (maxPromisesPerTry > 0)
    for (var i = 0; i < promises.length; i += maxPromisesPerTry)
      promisesBatch.push(promises.slice(i, i + maxPromisesPerTry));

  while (
    promisesBatchIndex < promisesBatch.length &&
    errorsTry < maxErrorsTry
  ) {
    try {
      (await Promise.all(promisesBatch[promisesBatchIndex])).map(
        targetObjectUpdated => {
          targetObject = Object.assign(targetObject, targetObjectUpdated);
        }
      );
      promisesBatchIndex++;
    } catch (e) {
      console.error(e);
      errorsTry++;
    } finally {
      if (errorsTry >= maxErrorsTry)
        console.error('[BATCH PROMISES] (max errors reached)');
    }
  }
  return targetObject;
}
