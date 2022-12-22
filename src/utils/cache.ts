import { Contract } from 'ethers';
import _ from 'lodash';
import { MAX_BLOCKS_PER_EVENTS_FETCH } from './constants';
import { sleep } from './helpers';

const Web3 = require('web3');
const web3 = new Web3();

const arbitrum = require('../configs/arbitrum/config.json');
const arbitrumTestnet = require('../configs/arbitrumTestnet/config.json');
const arbitrumNitroTestnet = require('../configs/arbitrumNitroTestnet/config.json');
const mainnet = require('../configs/mainnet/config.json');
const xdai = require('../configs/xdai/config.json');
const goerli = require('../configs/goerli/config.json');
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
    arbitrumNitroTestnet,
    mainnet,
    xdai,
    goerli,
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

  let events = [];
  let currentFrom = fromBlock;
  let currentTo = fromBlock + maxBlocksPerFetch;

  console.debug(
    `Fetching logs of ${contractAddress} from blocks ${fromBlock} -> ${toBlock}, topics: ${topicsToGet}`
  );
  for (let i = fromBlock; i < toBlock; i += maxBlocksPerFetch) {
    if (currentTo > toBlock) {
      currentTo = toBlock;
    }

    try {
      let eventsFetched = await web3.eth.getPastLogs({
        address: contractAddress,
        fromBlock: currentFrom,
        toBlock: currentTo,
        topics: topicsToGet,
      });
      eventsFetched = await getTimestampOfEvents(web3, eventsFetched);
      events = events.concat(eventsFetched);
    } catch (error) {
      if ((error as Error).message.indexOf('Relay attempts exhausted') > -1) {
        const blocksToLower = Math.max(
          Math.trunc((currentTo - currentFrom) / 2),
          10000
        );
        console.error('Relay attempts exhausted');
        console.debug('Lowering toBlock', blocksToLower, 'blocks');
        currentTo = currentTo - blocksToLower;
        await sleep(5000);
      } else if (
        (error as Error).message.indexOf(
          'You cannot query logs for more than 100000 blocks at once.'
        ) > -1
      ) {
        maxBlocksPerFetch = Number((maxBlocksPerFetch / 4).toFixed(0));
        currentTo = currentFrom + 100000;
        console.error(
          'You cannot query logs for more than 100000 blocks at once.'
        );
        console.debug('Lowering toBlock', currentTo);
      }
    }
  }
  return sortEvents(events);
};

export const getTimestampOfEvents = async function (web3, events) {
  await batchPromises(
    events.map(async (event, i) => {
      const blockInfo = await web3.eth.getBlock(event.blockNumber);
      if (!blockInfo) console.log(event.blockNumber);
      for (let i = 0; i < events.length; i++) {
        if (events[i].blockNumber === blockInfo.number)
          events[i].timestamp = blockInfo.timestamp;
        if (blockInfo.l2BlockNumber)
          events[i].blockNumber = Number(blockInfo.l2BlockNumber);
      }
    }),
    100,
    1000,
    500
  );
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
        : callResult;
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
  maxPromisesPerTry,
  maxTries = 10,
  sleepTimeBetweenRetries = 100,
  sleepTimeBetweenPromises = 100
) {
  const promisesBatch =
    maxPromisesPerTry > 0
      ? chunkArray(promises, maxPromisesPerTry)
      : [promises];
  let promisesBatchIndex = 0;

  while (promisesBatchIndex < promisesBatch.length && maxTries > 0) {
    try {
      const batchResults = await Promise.all(promisesBatch[promisesBatchIndex]);
      batchResults.map(result => {
        targetObject = Object.assign(targetObject, result);
      });
      promisesBatchIndex++;
    } catch (e) {
      console.error(e);
      if (
        e.message == 'Internal JSON-RPC error.' ||
        e.message == 'Unexpected end of JSON input'
      ) {
        console.log(
          'Internal error in RPC, waiting 1 second and trying again...'
        );
        await sleep(1000);
      } else {
        maxTries--;
        await sleep(sleepTimeBetweenRetries);
        if (maxTries === 0)
          console.error('[BATCH PROMISES] (max errors reached)');
      }
    }
    await sleep(sleepTimeBetweenPromises);
  }
  return targetObject;
}

export async function batchPromises(
  promises,
  maxPromisesPerTry = 0,
  maxTries = 10,
  sleepTimeBetweenRetries = 100
) {
  const promisesBatch =
    maxPromisesPerTry > 0
      ? chunkArray(promises, maxPromisesPerTry)
      : [promises];
  let promisesBatchIndex = 0;

  while (promisesBatchIndex < promisesBatch.length && maxTries > 0) {
    try {
      await Promise.all(promisesBatch[promisesBatchIndex]);
      promisesBatchIndex++;
    } catch (e) {
      console.error(e);
      maxTries--;
      await sleep(sleepTimeBetweenRetries);
      if (maxTries === 0)
        console.error('[BATCH PROMISES] (max errors reached)');
    }
  }
}

function chunkArray(array, chunkSize) {
  const chunkedArray = [];
  let index = 0;
  while (index < array.length) {
    chunkedArray.push(array.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunkedArray;
}
