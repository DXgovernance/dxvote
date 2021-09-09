import contentHash from 'content-hash';
import _ from "lodash";
import axios from 'axios';
import { ZERO_ADDRESS } from './index';

const appConfig = require('../appConfig.json');

const ipfsHashOfAppConfig = appConfig.configHash;

const Web3 = require('web3');
const web3 = new Web3();

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
        if (events[i].blockNumber === blockInfo.number)
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
  return _.orderBy( events , ["l1BlockNumber", "l2BlockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc","asc"]);
};

export const executeMulticall = async function(web3, multicall, calls) {
  const rawCalls = calls.map((call) => {
    return [call[0]._address, web3.eth.abi.encodeFunctionCall(
      call[0]._jsonInterface.find(method => method.name === call[1]), call[2]
    )];
  });
  
  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData,
    decodedReturnData:returnData.map((callResult, i) => {
      return web3.eth.abi.decodeParameters(
        calls[i][0]._jsonInterface.find(method => method.name === calls[i][1]).outputs,
        callResult
      )["0"];
    })
  };
}

export const executeRawMulticall = async function(multicall, calls) {
  const rawCalls = calls.map((call) => {
    return [call[0], call[1]];
  });
  
  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData
  };
}

export const isNode = function () {
  return (typeof module !== 'undefined' && module.exports);
}

export const descriptionHashToIPFSHash = function (descriptionHash) {
  try {
    if (contentHash.getCodec(descriptionHash) === "ipfs-ns")
      return contentHash.decode(descriptionHash);
    else if (descriptionHash.length > 1 && descriptionHash.substring(0,2) != "Qm")
      return descriptionHash;
    else
      return "";
  } catch (error) {
    console.error('Error decoding descriptionHash', descriptionHash);
    return "";
  }
}

export const ipfsHashToDescriptionHash = function (ipfsHash) {
  try {
    if (ipfsHash.length > 1 && ipfsHash.substring(0,2) === "Qm")
      return contentHash.fromIpfs(ipfsHash);
    else if (contentHash.getCodec(ipfsHash) === "ipfs-ns")
      return ipfsHash;
    else
      return "";
  } catch (error) {
    console.error('Error encoding ipfsHash', ipfsHash);
    return "";
  }
}

export const getNetworkConfig = async function(networkName) {
  if (networkName === 'localhost') {
    return {
      fromBlock: 1,
      avatar: process.env.REACT_APP_AVATAR_ADDRESS.replace(/["']/g, ""),
      controller: process.env.REACT_APP_CONTROLLER_ADDRESS.replace(/["']/g, ""),
      reputation: process.env.REACT_APP_REPUTATION_ADDRESS.replace(/["']/g, ""),
      permissionRegistry: process.env.REACT_APP_PERMISSION_REGISTRY_ADDRESS.replace(/["']/g, ""),
      utils: {
        multicall: process.env.REACT_APP_MULTICALL_ADDRESS.replace(/["']/g, ""),
      },
      votingMachines: {
        dxd: {
          address: process.env.REACT_APP_VOTING_MACHINE_ADDRESS.replace(/["']/g, ""),
          token: process.env.REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS.replace(/["']/g, "")
        }
      },
    };
  } else {
    return (await axios({
      method: "GET",
      url: "https://gateway.pinata.cloud/ipfs/"+ipfsHashOfAppConfig
    })).data[networkName];
  }
}

export const getSchemeTypeData = function(networkConfig, schemeAddress) {
  if (networkConfig.daostack) {
    if (networkConfig.daostack.schemeRegistrar && networkConfig.daostack.schemeRegistrar.address === schemeAddress) {
      return {
        type: "SchemeRegistrar",
        name: "SchemeRegistrar",
        contractToCall: networkConfig.daostack.schemeRegistrar.contractToCall,
        votingMachine: networkConfig.votingMachines.gen.address,
        newProposalTopics: networkConfig.daostack.schemeRegistrar.newProposalTopics,
        voteParams: networkConfig.daostack.contributionReward.voteParams,
        creationLogEncoding: networkConfig.daostack.schemeRegistrar.creationLogEncoding
      };
    } else if (networkConfig.daostack.contributionReward && networkConfig.daostack.contributionReward.address === schemeAddress) {
      return {
        type: "ContributionReward",
        name: "ContributionReward",
        contractToCall: networkConfig.daostack.contributionReward.contractToCall,
        votingMachine: networkConfig.votingMachines.gen.address,
        newProposalTopics: networkConfig.daostack.contributionReward.newProposalTopics,
        voteParams: networkConfig.daostack.contributionReward.voteParams,
        creationLogEncoding: networkConfig.daostack.contributionReward.creationLogEncoding
      };
    } else if (networkConfig.daostack.competitionScheme && networkConfig.daostack.competitionScheme.address === schemeAddress) {
      return {
        type: "CompetitionScheme",
        name: "CompetitionScheme",
        contractToCall: networkConfig.daostack.competitionScheme.contractToCall,
        votingMachine: networkConfig.votingMachines.gen.address,
        newProposalTopics: networkConfig.daostack.competitionScheme.newProposalTopics,
        creationLogEncoding: networkConfig.daostack.competitionScheme.creationLogEncoding
      };
    } else if (networkConfig.daostack.multicallSchemes && Object.keys(networkConfig.daostack.multicallSchemes.addresses).indexOf(schemeAddress) > -1) {
      return {
        type: "GenericMulticall",
        votingMachine: networkConfig.votingMachines.gen.address,
        contractToCall: ZERO_ADDRESS,
        name: networkConfig.daostack.multicallSchemes.addresses[schemeAddress].name,
        newProposalTopics: networkConfig.daostack.multicallSchemes.newProposalTopics,
        voteParams: networkConfig.daostack.multicallSchemes.addresses[schemeAddress].voteParams,
        creationLogEncoding: networkConfig.daostack.multicallSchemes.creationLogEncoding
      };
    } else if (networkConfig.daostack.genericSchemes && Object.keys(networkConfig.daostack.genericSchemes.addresses).indexOf(schemeAddress) > -1) {
      return {
        type: "GenericScheme",
        votingMachine: networkConfig.daostack.genericSchemes.addresses[schemeAddress].votingMachine,
        contractToCall: networkConfig.daostack.genericSchemes.addresses[schemeAddress].contractToCall,
        name: networkConfig.daostack.genericSchemes.addresses[schemeAddress].name,
        newProposalTopics: networkConfig.daostack.genericSchemes.newProposalTopics,
        voteParams: networkConfig.daostack.genericSchemes.addresses[schemeAddress].voteParams,
        creationLogEncoding: networkConfig.daostack.genericSchemes.creationLogEncoding
      };
    } else if (networkConfig.daostack.dxSchemes && Object.keys(networkConfig.daostack.dxSchemes).indexOf(schemeAddress) > -1) {
      return {
        type: "OldDxScheme",
        votingMachine: networkConfig.votingMachines.gen.address,
        contractToCall: ZERO_ADDRESS,
        name: networkConfig.daostack.dxSchemes[schemeAddress],
        newProposalTopics: [],
        creationLogEncoding: []
      };
    }
  }
  return {
    type: "WalletScheme",
    votingMachine: networkConfig.votingMachines.dxd.address,
    name: "WalletScheme",
    newProposalTopics: [[
      web3.utils.soliditySha3("ProposalStateChange(bytes32,uint256)"),
      null,
      '0x0000000000000000000000000000000000000000000000000000000000000001']
    ],
    creationLogEncoding: []
  }
}
