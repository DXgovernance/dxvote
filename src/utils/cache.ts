const axios = require('axios');
import contentHash from 'content-hash';
import { bnum, ZERO_HASH, ZERO_ADDRESS, sleep } from './helpers';
const { getEvents, getRawEvents, sortEvents } = require('./cacheEvents');
const { decodePermission } = require('./permissions');
const { decodeSchemeParameters } = require('./scheme');
import { DaoNetworkCache } from '../types';
const WalletSchemeJSON = require('../contracts/WalletScheme');
const { getContracts } = require('../contracts');
const { getSchemeTypeData } = require('../config');

async function executeMulticall(web3, multicall, calls) {
  
  const rawCalls = calls.map((call) => {
    return [call[0]._address, web3.eth.abi.encodeFunctionCall(
      call[0]._jsonInterface.find(method => method.name == call[1]), call[2]
    )];
  });
  
  const { returnData } = await multicall.methods.aggregate(rawCalls).call();

  return {
    returnData,
    decodedReturnData:returnData.map((callResult, i) => {
      return web3.eth.abi.decodeParameters(
        calls[i][0]._jsonInterface.find(method => method.name == calls[i][1]).outputs,
        callResult
      )["0"];
    })
  };
}

export const updateNetworkCache = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  console.debug('[Cache Update]', fromBlock, toBlock);
  const networkContracts = await getContracts(networkName, web3);
  
  (await Promise.all([
    updateDaoInfo(networkCache, networkContracts, web3),
    updateReputationEvents(networkCache, networkContracts.reputation, fromBlock, toBlock, web3)
  ])).map((networkCacheUpdated) => {
    networkCache = networkCacheUpdated;
  });
  
  await Promise.all(Object.keys(networkContracts.votingMachines).map(async (votingMachineAddress) => {
  
    if (!networkCache.votingMachines[votingMachineAddress])
      networkCache.votingMachines[votingMachineAddress] = {
        name: networkContracts.votingMachines[votingMachineAddress].name,
        events: {
          votes: [],
          stakes: [],
          redeems: [],
          redeemsRep: [],
          proposalStateChanges: [],
          newProposal: []
        },
        token: {
          address: networkContracts.votingMachines[votingMachineAddress].token._address,
          totalSupply: bnum(0)
        },
        votingParameters: {}
      };
  
    networkCache = await updateVotingMachine(
      networkCache,
      networkContracts.avatar._address,
      networkContracts.votingMachines[votingMachineAddress].contract,
      networkContracts.multicall,
      fromBlock,
      toBlock,
      web3
    );
  
  }));
  
  networkCache = await updateSchemes(networkCache, networkName, fromBlock, toBlock, web3);
  
  (await Promise.all([
    updatePermissionRegistry(networkCache, networkName, fromBlock, toBlock, web3),
    updateProposals(networkCache, networkName, fromBlock, toBlock, web3)
  ])).map((networkCacheUpdated) => {
    networkCache = networkCacheUpdated;
  });

  networkCache.l1BlockNumber = Number(toBlock);
  networkCache.l2BlockNumber = 0;
  
  console.debug('Total Proposals', Object.keys(networkCache.proposals).length);

  return networkCache;
}

// Update the DAOinfo field in cache
export const updateDaoInfo = async function (
  networkCache: DaoNetworkCache, allContracts: any, web3: any
): Promise<DaoNetworkCache> {
  let callsToExecute = [
    [allContracts.reputation, "totalSupply", []],
    [allContracts.multicall, "getEthBalance", [allContracts.avatar._address]]
  ];
  const callsResponse = await executeMulticall(web3, allContracts.multicall, callsToExecute);
  networkCache.daoInfo.address = allContracts.avatar._address;
  networkCache.daoInfo.repEvents = !networkCache.daoInfo.repEvents ? [] : networkCache.daoInfo.repEvents;
  networkCache.daoInfo.totalRep = bnum(callsResponse.decodedReturnData[0]);
  networkCache.daoInfo.ethBalance = bnum(callsResponse.decodedReturnData[1]);
  networkCache.daoInfo.tokenBalances = {};
  return networkCache;
}

// Get all Mint and Burn reputation events to calculate rep by time off chain
export const updateReputationEvents = async function (
  networkCache: DaoNetworkCache, reputation: any, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {

  if (!networkCache.daoInfo.repEvents)
    networkCache.daoInfo.repEvents = [];

  let reputationEvents = sortEvents( await getEvents(web3, reputation, fromBlock, toBlock, 'allEvents'));

  reputationEvents.map((reputationEvent) => {
    switch (reputationEvent.event) {
      case "Mint":
        networkCache.daoInfo.repEvents.push({
          event: reputationEvent.event,
          signature: reputationEvent.signature,
          address: reputationEvent.address,
          account: reputationEvent.returnValues._to,
          amount: bnum(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          l1BlockNumber: reputationEvent.l1BlockNumber,
          l2BlockNumber: reputationEvent.l2BlockNumber,
          timestamp: reputationEvent.timestamp,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex
        });
        if (!networkCache.users[reputationEvent.returnValues._to]) {
          networkCache.users[reputationEvent.returnValues._to] = {
            repBalance: bnum(reputationEvent.returnValues._amount),
            proposalsCreated: []
          }
        } else {
          networkCache.users[reputationEvent.returnValues._to].repBalance = 
            bnum(networkCache.users[reputationEvent.returnValues._to].repBalance).plus(reputationEvent.returnValues._amount)
        }
      break;
      case "Burn":
        networkCache.daoInfo.repEvents.push({
          event: reputationEvent.event,
          signature: reputationEvent.signature,
          address: reputationEvent.address,
          account: reputationEvent.returnValues._from,
          amount: bnum(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          l1BlockNumber: reputationEvent.l1BlockNumber,
          l2BlockNumber: reputationEvent.l2BlockNumber,
          timestamp: reputationEvent.timestamp,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex
        });
        networkCache.users[reputationEvent.returnValues._from].repBalance =
          bnum(networkCache.users[reputationEvent.returnValues._from].repBalance)
          .minus(reputationEvent.returnValues._amount)
      break;
    }
  });
  
  return networkCache;
}

// Update all voting machine information, events, token and voting parameters used.
export const updateVotingMachine = async function (
  networkCache: DaoNetworkCache,
  avatarAddress: string,
  votingMachine: any,
  multicall: any,
  fromBlock: string,
  toBlock: string,
  web3: any
): Promise<DaoNetworkCache> {

  let newVotingMachineEvents = sortEvents(
    await getEvents(web3, votingMachine, fromBlock, toBlock, 'allEvents')
  );
  const votingMachineEventsInCache = networkCache.votingMachines[votingMachine._address].events;
  const votingMachineParamsHash = [];

  newVotingMachineEvents.map((votingMachineEvent) => {
    const proposalCreated = votingMachineEventsInCache.newProposal
      .findIndex(newProposalEvent => votingMachineEvent.returnValues._proposalId == newProposalEvent.proposalId) > -1;
    
    if (votingMachineEvent.returnValues._organization == avatarAddress
      || (votingMachineEvent.event == "StateChange" && proposalCreated))
      switch (votingMachineEvent.event) {
        case "NewProposal":
          votingMachineEventsInCache.newProposal.push({
            event: votingMachineEvent.event,
            signature: votingMachineEvent.signature,
            address: votingMachineEvent.address,
            proposer: votingMachineEvent.returnValues._proposer,
            paramHash: votingMachineEvent.returnValues._paramsHash,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
          
        if (votingMachineParamsHash.indexOf(votingMachineEvent.returnValues._paramsHash) < 0)
          votingMachineParamsHash.push(votingMachineEvent.returnValues._paramsHash);
        break;
        case "StateChange":
          votingMachineEventsInCache.proposalStateChanges.push({
            event: votingMachineEvent.event,
            signature: votingMachineEvent.signature,
            address: votingMachineEvent.address,
            state: votingMachineEvent.returnValues._proposalState,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "VoteProposal":
          
          const preBoosted = votingMachineEventsInCache.proposalStateChanges
            .findIndex(i => i.state === "5") >= 0;

          votingMachineEventsInCache.votes.push({
            event: votingMachineEvent.event,
            signature: votingMachineEvent.signature,
            address: votingMachineEvent.address,
            voter: votingMachineEvent.returnValues._voter,
            vote: votingMachineEvent.returnValues._vote,
            amount: votingMachineEvent.returnValues._reputation,
            preBoosted: preBoosted,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "Stake":
        votingMachineEventsInCache.stakes.push({
          event: votingMachineEvent.event,
          signature: votingMachineEvent.signature,
          address: votingMachineEvent.address,
            staker: votingMachineEvent.returnValues._staker,
            vote: votingMachineEvent.returnValues._vote,
            amount: votingMachineEvent.returnValues._amount,
            amount4Bounty: bnum("0"),
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "Redeem":
          votingMachineEventsInCache.redeems.push({
            event: votingMachineEvent.event,
            signature: votingMachineEvent.signature,
            address: votingMachineEvent.address,
            beneficiary: votingMachineEvent.returnValues._beneficiary,
            amount: votingMachineEvent.returnValues._amount,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "RedeemReputation":
          votingMachineEventsInCache.redeemsRep.push({
            event: votingMachineEvent.event,
            signature: votingMachineEvent.signature,
            address: votingMachineEvent.address,
            beneficiary: votingMachineEvent.returnValues._beneficiary,
            amount: votingMachineEvent.returnValues._amount,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
            timestamp: votingMachineEvent.timestamp,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
      }
  });
  
  const callsToExecute = [];
  for (let i = 0; i < votingMachineParamsHash.length; i++) {
    callsToExecute.push([
      votingMachine,
      "parameters",
      [votingMachineParamsHash[i]]
    ]);
  }

  const callsResponse = await executeMulticall(web3, multicall, callsToExecute);

  for (let i = 0; i < callsResponse.returnData.length; i++) {
    networkCache.votingMachines[votingMachine._address].votingParameters[ votingMachineParamsHash[i] ] =
      decodeSchemeParameters(web3.eth.abi.decodeParameters(
        [
          {type: 'uint256', name: 'queuedVoteRequiredPercentage' },
          {type: 'uint256', name: 'queuedVotePeriodLimit' },
          {type: 'uint256', name: 'boostedVotePeriodLimit' },
          {type: 'uint256', name: 'preBoostedVotePeriodLimit' },
          {type: 'uint256', name: 'thresholdConst' },
          {type: 'uint256', name: 'limitExponentValue' },
          {type: 'uint256', name: 'quietEndingPeriod' },
          {type: 'uint256', name: 'proposingRepReward' },
          {type: 'uint256', name: 'votersReputationLossRatio' },
          {type: 'uint256', name: 'minimumDaoBounty' },
          {type: 'uint256', name: 'daoBountyConst' },
          {type: 'uint256', name: 'activationTime' }
        ], callsResponse.returnData[i])
      );
    }
  
  networkCache.votingMachines[votingMachine._address].events = votingMachineEventsInCache;

  return networkCache;
}

// Gets all teh events form the permission registry and stores the permissions set.
export const updatePermissionRegistry = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);
  if (allContracts.permissionRegistry._address != ZERO_ADDRESS) {
  
    let permissionRegistryEvents = sortEvents(
      await getEvents(web3, allContracts.permissionRegistry, fromBlock, toBlock, 'allEvents')
    );
    permissionRegistryEvents.map((permissionRegistryEvent) => {
      const eventValues = permissionRegistryEvent.returnValues;
      
      if (eventValues.from == allContracts.avatar._address) {
        
        Object.keys(networkCache.schemes).map((schemeAddress) => {
          if (networkCache.schemes[schemeAddress].controllerAddress == allContracts.controller._address) {
            networkCache.schemes[schemeAddress].callPermissions.push({
              asset: eventValues.asset,
              to: eventValues.to,
              functionSignature: eventValues.functionSignature,
              value: eventValues.value,
              fromTime: eventValues.fromTime
            })
          }
        });

      } else if (networkCache.schemes[eventValues.from]){
        
        networkCache.schemes[eventValues.from].callPermissions.push({
          asset: eventValues.asset,
          to: eventValues.to,
          functionSignature: eventValues.functionSignature,
          value: eventValues.value,
          fromTime: eventValues.fromTime
        })
        
      } else {
        console.error('[Scheme does not exist]', eventValues.from);
      }
      
    });
  }
  
  return networkCache;
}

// Update all the schemes information
export const updateSchemes = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);

  let controllerEvents = sortEvents(
    await getEvents(web3, allContracts.controller, fromBlock, toBlock, 'allEvents')
  );
  
  for (let controllerEventsIndex = 0; controllerEventsIndex < controllerEvents.length; controllerEventsIndex++) {
    const controllerEvent = controllerEvents[controllerEventsIndex];
    
    const schemeAddress = controllerEvent.returnValues._scheme;
    const walletSchemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
    
    // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
    if (controllerEvent.event == "RegisterScheme") {
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;
      
      console.debug('Register Scheme event for ', schemeAddress, schemeTypeData.name);
      
      let callsToExecute = [
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [allContracts.controller, "getSchemePermissions", [schemeAddress, allContracts.avatar._address]],
        [allContracts.controller, "getSchemeParameters", [schemeAddress, allContracts.avatar._address]]
      ];
      
      if (schemeTypeData.type == 'WalletScheme') {
        callsToExecute.push([walletSchemeContract, "controllerAddress", []]);
        callsToExecute.push([walletSchemeContract, "schemeName", []]);
        callsToExecute.push([walletSchemeContract, "maxSecondsForExecution", []]);
        callsToExecute.push([walletSchemeContract, "maxRepPercentageChange", []]);
      }
      
      const callsResponse1 = await executeMulticall(web3, allContracts.multicall, callsToExecute);
      
      const ethBalance = callsResponse1.decodedReturnData[0];
      const permissions = decodePermission(callsResponse1.decodedReturnData[1]);
      const paramsHash = (schemeTypeData.type == 'GenericScheme')
        ? schemeTypeData.voteParams
        : callsResponse1.decodedReturnData[2];

      const controllerAddress = (schemeTypeData.type == 'WalletScheme')
        ? callsResponse1.decodedReturnData[3]
        : allContracts.avatar._address;
      const schemeName = (schemeTypeData.type == 'WalletScheme')
        ? callsResponse1.decodedReturnData[4]
        : schemeTypeData.name;
      const maxSecondsForExecution = (schemeTypeData.type == 'WalletScheme')
        ? callsResponse1.decodedReturnData[5]
        : 0;
      const maxRepPercentageChange = (schemeTypeData.type == 'WalletScheme')
        ? callsResponse1.decodedReturnData[6]
        : 0;
      
      callsToExecute = [];
      if (schemeTypeData.type == 'WalletScheme') {
        callsToExecute.push([
          votingMachine,
          "getBoostedVoteRequiredPercentage",
          [schemeAddress, allContracts.avatar._address, paramsHash]
        ]);
      }
      
      if (
        paramsHash != ZERO_HASH
        && !networkCache.votingMachines[votingMachine._address].votingParameters[paramsHash]
      ) {
        callsToExecute.push([
          votingMachine,
          "parameters",
          [paramsHash]
        ]);
      }

      const callsResponse2 = await executeMulticall(web3, allContracts.multicall, callsToExecute);
      
      const boostedVoteRequiredPercentage = (schemeTypeData.type == 'WalletScheme')
        ? web3.eth.abi.decodeParameters(['uint256'], callsResponse2.returnData[0])['0']
        : 0;
      
      if (
        paramsHash != ZERO_HASH
        && !networkCache.votingMachines[votingMachine._address].votingParameters[paramsHash]
      ) {
        try {
          networkCache.votingMachines[votingMachine._address].votingParameters[paramsHash] =
          decodeSchemeParameters(web3.eth.abi.decodeParameters(
            [
              {type: 'uint256', name: 'queuedVoteRequiredPercentage' },
              {type: 'uint256', name: 'queuedVotePeriodLimit' },
              {type: 'uint256', name: 'boostedVotePeriodLimit' },
              {type: 'uint256', name: 'preBoostedVotePeriodLimit' },
              {type: 'uint256', name: 'thresholdConst' },
              {type: 'uint256', name: 'limitExponentValue' },
              {type: 'uint256', name: 'quietEndingPeriod' },
              {type: 'uint256', name: 'proposingRepReward' },
              {type: 'uint256', name: 'votersReputationLossRatio' },
              {type: 'uint256', name: 'minimumDaoBounty' },
              {type: 'uint256', name: 'daoBountyConst' },
              {type: 'uint256', name: 'activationTime' }
            ], callsResponse2.returnData[1])
          );
        } catch (error) {
          console.error("Error getting parameters configuration for", schemeTypeData.name);
        }
      }
    
      if (!networkCache.schemes[schemeAddress]) {
        networkCache.schemes[schemeAddress] = {
          address: schemeAddress,
          registered: true,
          controllerAddress,
          name: schemeName,
          type: schemeTypeData.type,
          ethBalance: ethBalance,
          tokenBalances: {},
          votingMachine: schemeTypeData.votingMachine,
          paramsHash: paramsHash,
          permissions,
          boostedVoteRequiredPercentage,
          callPermissions: [],
          proposalIds: [],
          boostedProposals: 0,
          maxSecondsForExecution,
          maxRepPercentageChange,
          newProposalEvents: []
        };
      } else {
        networkCache.schemes[schemeAddress].paramsHash = paramsHash;
        networkCache.schemes[schemeAddress].permissions = permissions;
        networkCache.schemes[schemeAddress].boostedVoteRequiredPercentage = boostedVoteRequiredPercentage;
      }
    
    // Mark scheme as not registered but save all previous data
    } else if (
      controllerEvent.event == "UnregisterScheme" && 
      // This condition is added to skip the first scheme added (that is the dao creator account)
      (controllerEvent.returnValues._sender != schemeAddress)
    ) {
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;

      console.debug('Unregister scheme event', schemeAddress, schemeTypeData.name);
      let callsToExecute = [
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [
          votingMachine,
          "orgBoostedProposalsCnt", 
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address)]
        ]
      ];
      
      if (networkCache.schemes[schemeAddress].type == 'WalletScheme') {
        callsToExecute.push([walletSchemeContract, "maxSecondsForExecution", []]);
      }
      const callsResponse = await executeMulticall(web3, allContracts.multicall, callsToExecute);
      
      const maxSecondsForExecution = (networkCache.schemes[schemeAddress].type == 'WalletScheme') 
        ? callsResponse.decodedReturnData[2]
        : 0;
      
      // Update the scheme values a last time
      networkCache.schemes[schemeAddress].ethBalance = callsResponse.decodedReturnData[0];
      networkCache.schemes[schemeAddress].boostedProposals = callsResponse.decodedReturnData[1];
      networkCache.schemes[schemeAddress].maxSecondsForExecution = maxSecondsForExecution;
      networkCache.schemes[schemeAddress].registered = false;
    }
    
  };
  
  // Update registered schemes
  await Promise.all(Object.keys(networkCache.schemes).map(async (schemeAddress) => {
    if (networkCache.schemes[schemeAddress].registered) {
      
      const walletSchemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;
      
      let callsToExecute = [
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [
          votingMachine,
          "orgBoostedProposalsCnt", 
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address)]
        ]
      ];
      
      if (networkCache.schemes[schemeAddress].type == 'WalletScheme') {
        callsToExecute.push([walletSchemeContract, "maxSecondsForExecution", []]);
        callsToExecute.push([
          votingMachine,
          "boostedVoteRequiredPercentage",
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address), networkCache.schemes[schemeAddress].paramsHash]
        ])
      }
      const callsResponse = await executeMulticall(web3, allContracts.multicall, callsToExecute);
      
      const maxSecondsForExecution = (networkCache.schemes[schemeAddress].type == 'WalletScheme') 
        ? callsResponse.decodedReturnData[2]
        : 0;
        
      const boostedVoteRequiredPercentage = (schemeTypeData.type == 'WalletScheme')
        ? web3.eth.abi.decodeParameters(['uint256'], callsResponse.returnData[3])['0']
        : 0;
      
      networkCache.schemes[schemeAddress].ethBalance = callsResponse.decodedReturnData[0];
      networkCache.schemes[schemeAddress].boostedProposals = callsResponse.decodedReturnData[1];
      networkCache.schemes[schemeAddress].maxSecondsForExecution = maxSecondsForExecution;
      networkCache.schemes[schemeAddress].boostedVoteRequiredPercentage = boostedVoteRequiredPercentage;
    }

  }));
  
  return networkCache;
};

// Update all the proposals information
export const updateProposals = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);
  const avatarAddress = allContracts.avatar._address;
  const avatarAddressEncoded = web3.eth.abi.encodeParameter('address', avatarAddress);
  
  // Get new proposals
  await Promise.all(Object.keys(networkCache.schemes).map(async (schemeAddress) => {

    const walletSchemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
    const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
    const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;
  
    let schemeEvents = [];
    for (let i = 0; i < schemeTypeData.newProposalTopics.length; i++) {
      schemeEvents = schemeEvents.concat(await getRawEvents(
        web3,
        schemeAddress,
        fromBlock,
        toBlock,
        schemeTypeData.newProposalTopics[i]
      ));
    }
    
    console.debug("Getting proposals of", schemeTypeData.name, schemeEvents.length);
    
    let schemeEventsBatchs = [];
    let schemeEventsBatchsIndex = 0;
    for (var i = 0; i < schemeEvents.length; i += 50)
      schemeEventsBatchs.push(schemeEvents.slice(i, i + 50));
    
    while(schemeEventsBatchsIndex < schemeEventsBatchs.length) {
      
      try {
        
        await Promise.all(schemeEventsBatchs[schemeEventsBatchsIndex].map(async (schemeEvent) => {

          const proposalId = (schemeEvent.topics[1] == avatarAddressEncoded)
          ? web3.eth.abi.decodeParameter('bytes32', schemeEvent.topics[2])
          : web3.eth.abi.decodeParameter('bytes32', schemeEvent.topics[1]);
          
          // Get all the proposal information from the scheme and voting machine
          let callsToExecute = [
            [ 
              votingMachine,
              "proposals",
              [proposalId]
            ],
            [ 
              votingMachine,
              "voteStatus",
              [proposalId,
                1] ],
            [ 
              votingMachine,
              "voteStatus",
              [proposalId,
                2] ],
            [ 
              votingMachine,
              "proposalStatus",
              [proposalId]
            ],
            [ 
              votingMachine,
              "getProposalTimes",
              [proposalId]
            ]
          ];
          
          if (schemeTypeData.type == 'WalletScheme') {
            callsToExecute.push([ walletSchemeContract, "getOrganizationProposal", [proposalId] ]);
          }
          
          const callsResponse = await executeMulticall(web3, allContracts.multicall, callsToExecute);
          
          const votingMachineProposalInfo = web3.eth.abi.decodeParameters(
            [
              {type: 'bytes32', name: 'organizationId' },
              {type: 'address', name: 'callbacks' },
              {type: 'uint256', name: 'state' },
              {type: 'uint256', name: 'winningVote' },
              {type: 'address', name: 'proposer' },
              {type: 'uint256', name: 'currentBoostedVotePeriodLimit' },
              {type: 'bytes32', name: 'paramsHash' },
              {type: 'uint256', name: 'daoBountyRemain' },
              {type: 'uint256', name: 'daoBounty' },
              {type: 'uint256', name: 'totalStakes' },
              {type: 'uint256', name: 'confidenceThreshold' },
              {type: 'uint256', name: 'secondsFromTimeOutTillExecuteBoosted' }
            ],
            callsResponse.returnData[0]
          );
          const positiveVotes = callsResponse.returnData[1];
          const negativeVotes = callsResponse.returnData[2];
          
          const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
            ['uint256','uint256','uint256','uint256'], 
            callsResponse.returnData[3]
          );
          const proposalTimes = callsResponse.decodedReturnData[4];
          
          let schemeProposalInfo = {
            to: [],
            callData: [],
            value: [],
            state: 0,
            title: "",
            descriptionHash: "",
            submittedTime: 0
          };
          let decodedProposer;
          let creationLogDecoded;
          
          if (schemeTypeData.type == 'WalletScheme') {
            schemeProposalInfo = web3.eth.abi.decodeParameters(
                [ 
                  {type: 'address[]', name: 'to' },
                  {type: 'bytes[]', name: 'callData' },
                  {type: 'uint256[]', name: 'value' },
                  {type: 'uint256', name: 'state' },
                  {type: 'string', name: 'title' },
                  {type: 'string', name: 'descriptionHash' },
                  {type: 'uint256', name: 'submittedTime' }
                ],
                callsResponse.returnData[5]
              );
          } else {
            const transactionReceipt = await web3.eth.getTransactionReceipt(schemeEvent.transactionHash);
            try {
              schemeTypeData.newProposalTopics.map((newProposalTopic, i) => {
                transactionReceipt.logs.map((log) => {
                  if (log.topics[0] == "0x75b4ff136cc5de5957574c797de3334eb1c141271922b825eb071e0487ba2c5c") {
                    decodedProposer = web3.eth.abi.decodeParameters([
                      { type:'uint256', name: "_numOfChoices"},
                      { type:'address', name: "_proposer"},
                      { type:'bytes32', name: "_paramsHash"}
                    ], log.data)._proposer
                  }
                  if (!creationLogDecoded && (log.topics[0] == newProposalTopic[0])) {
                    creationLogDecoded = web3.eth.abi.decodeParameters(schemeTypeData.creationLogEncoding[i], log.data)
                    if (creationLogDecoded._descriptionHash.length > 0 && creationLogDecoded._descriptionHash != ZERO_HASH) {
                      schemeProposalInfo.descriptionHash = contentHash.fromIpfs(creationLogDecoded._descriptionHash);
                    }
                  }
                  
                })
              });
              
            } catch (error) {
              console.error('Error on adding content hash from tx', schemeEvent.transactionHash);
            }
            
            if (schemeTypeData.type == 'SchemeRegistrar') {
              
              schemeProposalInfo.to = [schemeTypeData.contractToCall];
              schemeProposalInfo.value = [0];
              
              if (creationLogDecoded._parametersHash) {
                schemeProposalInfo.callData = [
                  web3.eth.abi.encodeFunctionCall({
                    name: 'registerScheme',
                    type: 'function',
                    inputs: [
                      { type: 'address', name: '_scheme' },
                      { type: 'bytes32', name: '_paramsHash' },
                      { type: 'bytes4', name: '_permissions' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded["_scheme "],
                    creationLogDecoded._parametersHash,
                    creationLogDecoded._permissions,
                    avatarAddress
                  ]
                )];
              } else {
                schemeProposalInfo.callData = [
                  web3.eth.abi.encodeFunctionCall({
                    name: 'unregisterScheme',
                    type: 'function',
                    inputs: [
                      { type: 'address', name: '_scheme' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded["_scheme "],
                    avatarAddress
                  ]
                )];
              }
              
            } else if (schemeTypeData.type == "ContributionReward") {
              
              if (creationLogDecoded._reputationChange > 0) {
                schemeProposalInfo.to.push(schemeTypeData.contractToCall);
                schemeProposalInfo.value.push(0);
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'mintReputation',
                    type: 'function',
                    inputs: [
                      { type: 'uint256', name: '_amount' },
                      { type: 'address', name: '_to' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded._reputationChange,
                    creationLogDecoded._beneficiary,
                    avatarAddress
                  ]
                ));
              } else if (creationLogDecoded._reputationChange < 0) {

                schemeProposalInfo.to.push(schemeTypeData.contractToCall);
                schemeProposalInfo.value.push(0);
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'burnReputation',
                    type: 'function',
                    inputs: [
                      { type: 'uint256', name: '_amount' },
                      { type: 'address', name: '_from' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    bnum(creationLogDecoded._reputationChange).times(-1),
                    creationLogDecoded._beneficiary,
                    avatarAddress
                  ]
                ));
              }
              
              if (creationLogDecoded._rewards[0] > 0) {
                schemeProposalInfo.to.push(schemeTypeData.contractToCall);
                schemeProposalInfo.value.push(0);
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'mintTokens',
                    type: 'function',
                    inputs: [
                      { type: 'uint256', name: '_amount' },
                      { type: 'address', name: '_beneficiary' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded._rewards[0],
                    creationLogDecoded._beneficiary,
                    avatarAddress
                  ]
                ));
              }
              
              if (creationLogDecoded._rewards[1] > 0) {
                schemeProposalInfo.to.push(schemeTypeData.contractToCall);
                schemeProposalInfo.value.push(0);
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'sendEther',
                    type: 'function',
                    inputs: [
                      { type: 'uint256', name: '_amountInWei' },
                      { type: 'address', name: '_to' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded._rewards[1],
                    creationLogDecoded._beneficiary,
                    avatarAddress
                  ]
                ));
              }
              
              if (creationLogDecoded._rewards[2] > 0) {
                schemeProposalInfo.to.push(schemeTypeData.contractToCall);
                schemeProposalInfo.value.push(0);
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'externalTokenTransfer',
                    type: 'function',
                    inputs: [
                      { type: 'address', name: '_externalToken' },
                      { type: 'address', name: '_to' },
                      { type: 'uint256', name: '_value' },
                      { type: 'address', name: '_avatar' },
                    ]
                  },[
                    creationLogDecoded._externalToken,
                    creationLogDecoded._beneficiary,
                    creationLogDecoded._rewards[2],
                    avatarAddress
                  ]
                ));
              }
              
            } else if (schemeTypeData.type == "GenericScheme") {
              
              schemeProposalInfo.to = [allContracts.controller._address];
              schemeProposalInfo.value = [0];
              schemeProposalInfo.callData = [
                web3.eth.abi.encodeFunctionCall({
                  name: 'genericCall',
                  type: 'function',
                  inputs: [
                    { type: 'address', name: '_contract' },
                    { type: 'bytes', name: '_data' },
                    { type: 'address', name: '_avatar' },
                    { type: 'uint256', name: '_value' },
                  ]
                },[
                  schemeTypeData.contractToCall,
                  creationLogDecoded._data,
                  avatarAddress,
                  creationLogDecoded._value
                ]
              )];
              
            } else if (schemeTypeData.type == "GenericMulticall") {
              
              for (let callIndex = 0; callIndex < creationLogDecoded._contractsToCall.length; callIndex++) {
                schemeProposalInfo.to.push(allContracts.controller._address);
                schemeProposalInfo.value.push(0)
                schemeProposalInfo.callData.push(
                  web3.eth.abi.encodeFunctionCall({
                    name: 'genericCall',
                    type: 'function',
                    inputs: [
                      { type: 'address', name: '_contract' },
                      { type: 'bytes', name: '_data' },
                      { type: 'address', name: '_avatar' },
                      { type: 'uint256', name: '_value' },
                    ]
                  },[
                    creationLogDecoded._contractsToCall[callIndex],
                    creationLogDecoded._callsData[callIndex],
                    avatarAddress,
                    creationLogDecoded._values[callIndex],
                  ]
                ));
              }
              
            }
          }
          
          networkCache.proposals[proposalId] = {
            id: proposalId,
            scheme: schemeAddress,
            to: schemeProposalInfo.to,
            title: schemeProposalInfo.title,
            callData: schemeProposalInfo.callData,
            values: schemeProposalInfo.value.map((value) => bnum(value)),
            stateInScheme: schemeProposalInfo.state,
            stateInVotingMachine: votingMachineProposalInfo.state,
            descriptionHash: schemeProposalInfo.descriptionHash,
            creationEventSender: (await web3.eth.getTransaction(schemeEvent.transactionHash)).from,
            creationEvent: {
              event: schemeEvent.event,
              signature: schemeEvent.signature,
              address: schemeEvent.address,
              tx: schemeEvent.transactionHash,
              l1BlockNumber: schemeEvent.l1BlockNumber,
              l2BlockNumber: schemeEvent.l2BlockNumber,
              timestamp: schemeEvent.timestamp,
              transactionIndex: schemeEvent.transactionIndex,
              logIndex: schemeEvent.logIndex
            },
            repAtCreation: bnum(await allContracts.reputation.methods.totalSupplyAt(schemeEvent.l1BlockNumber).call()),
            winningVote: votingMachineProposalInfo.winningVote,
            proposer: decodedProposer ? decodedProposer : votingMachineProposalInfo.proposer,
            currentBoostedVotePeriodLimit: votingMachineProposalInfo.currentBoostedVotePeriodLimit,
            paramsHash: votingMachineProposalInfo.paramsHash,
            daoBountyRemain: bnum(votingMachineProposalInfo.daoBountyRemain),
            daoBounty: bnum(votingMachineProposalInfo.daoBounty),
            totalStakes: bnum(votingMachineProposalInfo.totalStakes),
            confidenceThreshold: votingMachineProposalInfo.confidenceThreshold,
            secondsFromTimeOutTillExecuteBoosted: votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted,
            submittedTime: bnum(proposalTimes[0]),
            boostedPhaseTime: bnum(proposalTimes[1]),
            preBoostedPhaseTime: bnum(proposalTimes[2]),
            daoRedeemItsWinnings: votingMachineProposalInfo.daoRedeemItsWinnings,
            shouldBoost: false,
            positiveVotes: bnum(positiveVotes),
            negativeVotes: bnum(negativeVotes),
            preBoostedPositiveVotes: bnum(proposalStatusWithVotes[0]),
            preBoostedNegativeVotes: bnum(proposalStatusWithVotes[1]),
            positiveStakes: bnum(proposalStatusWithVotes[2]),
            negativeStakes: bnum(proposalStatusWithVotes[3])
          };
          
          networkCache.schemes[schemeAddress].proposalIds.push(proposalId);
          networkCache.schemes[schemeAddress].newProposalEvents.push({
            proposalId: proposalId,
            event: schemeEvent.event,
            signature: schemeEvent.signature,
            address: schemeEvent.address,
            tx: schemeEvent.transactionHash,
            l1BlockNumber: schemeEvent.l1BlockNumber,
            l2BlockNumber: schemeEvent.l2BlockNumber,
            timestamp: schemeEvent.timestamp,
            transactionIndex: schemeEvent.transactionIndex,
            logIndex: schemeEvent.logIndex
          });
          
          if (schemeProposalInfo.descriptionHash.length > 0)
            networkCache.ipfsHashes.push({
              hash: contentHash.decode(schemeProposalInfo.descriptionHash),
              type: 'proposal',
              name: proposalId
            });
          
          // Save proposal created in users
          if (!networkCache.users[votingMachineProposalInfo.proposer]) {
            networkCache.users[votingMachineProposalInfo.proposer] = {
              repBalance: bnum(0),
              proposalsCreated: [proposalId]
            }
          } else {
            networkCache.users[votingMachineProposalInfo.proposer].proposalsCreated.push(proposalId);
          }
        }));
        
        schemeEventsBatchsIndex ++;
      } catch (error) {
        console.error('Error:',error.message);
        console.debug('Trying again getting proposal info of schemeEventsBatchs index',schemeEventsBatchsIndex);
      }
    }
    
  }));
  
  // Update proposals title
  for (let proposalIndex = 0; proposalIndex < Object.keys(networkCache.proposals).length; proposalIndex++) {
    const proposal = networkCache.proposals[Object.keys(networkCache.proposals)[proposalIndex]];
    if (
      networkCache.schemes[proposal.scheme].type != "WalletScheme"
      && proposal.descriptionHash && proposal.descriptionHash.length > 0
      && proposal.title.length == 0
      // && proposal.creationEvent.l1BlockNumber < Number(toBlock) - 100000
    )
      try {
        console.debug('getting title from proposal', proposal.id, contentHash.decode(proposal.descriptionHash));
        const response = await axios.get('https://ipfs.io/ipfs/'+contentHash.decode(proposal.descriptionHash))
        if (response && response.data && response.data.title) {
          networkCache.proposals[proposal.id].title = response.data.title;
        } else {
          console.error('Couldnt not get title from', proposal.descriptionHash);
        }
        await sleep(1000);
      } catch (error) {
        console.error('Error getting title from', proposal.descriptionHash, 'waiting 2 seconds and trying again..');
        await sleep(2000);
      }
  }

  // Update existent active proposals
  await Promise.all(Object.keys(networkCache.proposals).map(async (proposalId) => {
    
    if (networkCache.proposals[proposalId].stateInVotingMachine > 2) {
  
      const schemeAddress = networkCache.proposals[proposalId].scheme;
      const walletSchemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;

      // Get all the proposal information from the scheme and voting machine
      let callsToExecute = [
        [ 
          votingMachine,
          "proposals",
          [proposalId]
        ],
        [ 
          votingMachine,
          "voteStatus",
          [proposalId, 1]
        ],
        [ 
          votingMachine,
          "voteStatus",
          [proposalId, 2]
        ],
        [ 
          votingMachine,
          "proposalStatus",
          [proposalId]
        ],
        [ 
          votingMachine,
          "getProposalTimes",
          [proposalId]
        ],
        [ 
          votingMachine,
          "shouldBoost",
          [proposalId]
        ]
      ];
  
      if (schemeTypeData.type == 'WalletScheme') {
        callsToExecute.push([ walletSchemeContract, "getOrganizationProposal", [proposalId] ]);
      }
  
      const callsResponse = await executeMulticall(web3, allContracts.multicall, callsToExecute);
  
      const votingMachineProposalInfo = web3.eth.abi.decodeParameters(
        [
          {type: 'bytes32', name: 'organizationId' },
          {type: 'address', name: 'callbacks' },
          {type: 'uint256', name: 'state' },
          {type: 'uint256', name: 'winningVote' },
          {type: 'address', name: 'proposer' },
          {type: 'uint256', name: 'currentBoostedVotePeriodLimit' },
          {type: 'bytes32', name: 'paramsHash' },
          {type: 'uint256', name: 'daoBountyRemain' },
          {type: 'uint256', name: 'daoBounty' },
          {type: 'uint256', name: 'totalStakes' },
          {type: 'uint256', name: 'confidenceThreshold' },
          {type: 'uint256', name: 'secondsFromTimeOutTillExecuteBoosted' }
        ],
        callsResponse.returnData[0]
      );
      const positiveVotes = callsResponse.returnData[1];
      const negativeVotes = callsResponse.returnData[2];
  
      const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
        ['uint256','uint256','uint256','uint256'], 
        callsResponse.returnData[3]
      );
      const proposalTimes = callsResponse.decodedReturnData[4];
      const proposalShouldBoost = callsResponse.decodedReturnData[5];
  
      const schemeProposalInfo = (schemeTypeData.type == 'WalletScheme')
        ? web3.eth.abi.decodeParameters(
          [ 
            {type: 'address[]', name: 'to' },
            {type: 'bytes[]', name: 'callData' },
            {type: 'uint256[]', name: 'value' },
            {type: 'uint256', name: 'state' },
            {type: 'string', name: 'title' },
            {type: 'string', name: 'descriptionHash' },
            {type: 'uint256', name: 'submittedTime' }
          ],
          callsResponse.returnData[6]
        )
        : {
          to: "",
          callData: [],
          value: [],
          state: 0,
          title: "",
          descriptionHash: "",
          submittedTime: 0
        };
  
      networkCache.proposals[proposalId].stateInScheme = schemeProposalInfo.state;
      networkCache.proposals[proposalId].stateInVotingMachine = votingMachineProposalInfo.state;
      networkCache.proposals[proposalId].winningVote = votingMachineProposalInfo.winningVote;
      networkCache.proposals[proposalId].currentBoostedVotePeriodLimit = votingMachineProposalInfo.currentBoostedVotePeriodLimit;
      networkCache.proposals[proposalId].daoBountyRemain = bnum(votingMachineProposalInfo.daoBountyRemain);
      networkCache.proposals[proposalId].daoBounty = bnum(votingMachineProposalInfo.daoBounty);
      networkCache.proposals[proposalId].totalStakes = bnum(votingMachineProposalInfo.totalStakes);
      networkCache.proposals[proposalId].confidenceThreshold = votingMachineProposalInfo.confidenceThreshold;
      networkCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted = votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted;
      networkCache.proposals[proposalId].boostedPhaseTime = bnum(proposalTimes[1]);
      networkCache.proposals[proposalId].preBoostedPhaseTime = bnum(proposalTimes[2]);
      networkCache.proposals[proposalId].daoRedeemItsWinnings = votingMachineProposalInfo.daoRedeemItsWinnings;
      networkCache.proposals[proposalId].shouldBoost = proposalShouldBoost;
      networkCache.proposals[proposalId].positiveVotes = bnum(positiveVotes);
      networkCache.proposals[proposalId].negativeVotes = bnum(negativeVotes);
      networkCache.proposals[proposalId].preBoostedPositiveVotes = bnum(proposalStatusWithVotes[0]);
      networkCache.proposals[proposalId].preBoostedNegativeVotes = bnum(proposalStatusWithVotes[1]);
      networkCache.proposals[proposalId].positiveStakes = bnum(proposalStatusWithVotes[2]);
      networkCache.proposals[proposalId].negativeStakes = bnum(proposalStatusWithVotes[3]);
  
      // Save proposal created in users if not saved already
      if (!networkCache.users[networkCache.proposals[proposalId].proposer]) {
        networkCache.users[networkCache.proposals[proposalId].proposer] = {
          repBalance: bnum(0),
          proposalsCreated: [proposalId]
        }
      } else if (networkCache.users[networkCache.proposals[proposalId].proposer].proposalsCreated.indexOf(proposalId) < 0) {
        networkCache.users[networkCache.proposals[proposalId].proposer].proposalsCreated.push(proposalId);
      }
  
    }
  
  }));
  
  return networkCache;
};
