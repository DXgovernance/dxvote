import contentHash from 'content-hash';
import { bnum } from './helpers';
const { getEvents, getRawEvents, sortEvents } = require('./cacheEvents');
const { decodePermission } = require('./permissions');
const { decodeSchemeParameters } = require('./scheme');
const { decodeStatus } = require('./proposals');
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
  
  const { returnData, blockNumber } = await multicall.methods.aggregate(rawCalls).call();

  return {
    blockNumber,
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
  console.debug('[Cache Update]', networkCache, fromBlock, toBlock);
  const networkContracts = await getContracts(networkName, web3);
  
  (await Promise.all([
    updateDaoInfo(networkCache, networkContracts, web3),
    updateReputationEvents(networkCache, networkContracts.reputation, fromBlock, toBlock)
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
          proposalStateChanges: []
        },
        token: {
          address: networkContracts.votingMachines[votingMachineAddress].token._address,
          totalSupply: bnum(0)
        }
      };
  
    networkCache = await updateVotingMachineEvents(
      networkCache, networkContracts.votingMachines[votingMachineAddress].contract, fromBlock, toBlock
    );

  }));
  
  networkCache = await updateSchemes(networkCache, networkName, fromBlock, toBlock, web3);
  
  (await Promise.all([
    updatePermissionRegistryEvents(networkCache, networkName, fromBlock, toBlock, web3),
    updateProposals(networkCache, networkName, fromBlock, toBlock, web3)
  ])).map((networkCacheUpdated) => {
    networkCache = networkCacheUpdated;
  });

  networkCache.blockNumber = Number(toBlock);
  
  console.debug('Total Proposals', Object.keys(networkCache.proposals).length);

  return networkCache;
}

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
  return networkCache;
}

export const updateReputationEvents = async function (
  networkCache: DaoNetworkCache, reputation: any, fromBlock: string, toBlock: string
): Promise<DaoNetworkCache> {

  if (!networkCache.daoInfo.repEvents)
    networkCache.daoInfo.repEvents = [];

  let reputationEvents = sortEvents( await getEvents(reputation, fromBlock, toBlock, 'allEvents'));
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
          block: reputationEvent.blockNumber,
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
          block: reputationEvent.blockNumber,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex
        });
        networkCache.users[reputationEvent.returnValues._from].repBalance =
          bnum(networkCache.users[reputationEvent.returnValues._from].repBalance).minus(reputationEvent.returnValues._amount)
      break;
    }
  });
  
  return networkCache;
}

export const updateVotingMachineEvents = async function (
  networkCache: DaoNetworkCache, votingMachine: any, fromBlock: string, toBlock: string
): Promise<DaoNetworkCache> {

  let newVotingMachineEvents = sortEvents(
    await getEvents(votingMachine, fromBlock, toBlock, 'allEvents')
  );
  const votingMachineEventsInCache = networkCache.votingMachines[votingMachine._address].events;
  
  newVotingMachineEvents.map((votingMachineEvent) => {
    switch (votingMachineEvent.event) {
      case "StateChange":
        votingMachineEventsInCache.proposalStateChanges.push({
          event: votingMachineEvent.event,
          signature: votingMachineEvent.signature,
          address: votingMachineEvent.address,
          state: votingMachineEvent.returnValues._proposalState,
          proposalId: votingMachineEvent.returnValues._proposalId,
          tx: votingMachineEvent.transactionHash,
          block: votingMachineEvent.blockNumber,
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
          block: votingMachineEvent.blockNumber,
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
          block: votingMachineEvent.blockNumber,
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
          block: votingMachineEvent.blockNumber,
          transactionIndex: votingMachineEvent.transactionIndex,
          logIndex: votingMachineEvent.logIndex
        });
      break;
      case "RedeemRep":
        votingMachineEventsInCache.redeemsRep.push({
          event: votingMachineEvent.event,
          signature: votingMachineEvent.signature,
          address: votingMachineEvent.address,
          beneficiary: votingMachineEvent.returnValues._beneficiary,
          amount: votingMachineEvent.returnValues._amount,
          proposalId: votingMachineEvent.returnValues._proposalId,
          tx: votingMachineEvent.transactionHash,
          block: votingMachineEvent.blockNumber,
          transactionIndex: votingMachineEvent.transactionIndex,
          logIndex: votingMachineEvent.logIndex
        });
      break;
    }
  });
  
  networkCache.votingMachines[votingMachine._address].events = votingMachineEventsInCache;

  return networkCache;
}

export const updatePermissionRegistryEvents = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);
  if (allContracts.permissionRegistry._address != '0x0000000000000000000000000000000000000000') {
  
    let permissionRegistryEvents = sortEvents(
      await getEvents(allContracts.permissionRegistry, fromBlock, toBlock, 'allEvents')
    );
    permissionRegistryEvents.map((permissionRegistryEvent) => {
      const eventValues = permissionRegistryEvent.returnValues;
      
      if (eventValues.from == allContracts.avatar._address) {
        
        Object.keys(networkCache.schemes).map((schemeAddress) => {
          if (networkCache.schemes[schemeAddress].controllerAddress == allContracts.controller._address) {
            
            if (eventValues.value != 0 && eventValues.fromTime != 0) {
              networkCache.schemes[schemeAddress].callPermissions.push({
                asset: eventValues.asset,
                to: eventValues.to,
                functionSignature: eventValues.functionSignature,
                value: eventValues.value,
                fromTime: eventValues.fromTime
              })
            } else {
              const permissionIndex = networkCache.schemes[schemeAddress].callPermissions
                .findIndex(i =>
                  i.asset === eventValues.asset
                  && i.to === eventValues.to
                  && i.functionSignature === eventValues.functionSignature
                );
              networkCache.schemes[schemeAddress].callPermissions.splice(permissionIndex, 1);
            }
            
          }
        });

      } else if (networkCache.schemes[eventValues.from]){
        
        if (eventValues.value != 0 && eventValues.fromTime != 0) {
          networkCache.schemes[eventValues.from].callPermissions.push({
            asset: eventValues.asset,
            to: eventValues.to,
            functionSignature: eventValues.functionSignature,
            value: eventValues.value,
            fromTime: eventValues.fromTime
          })
        } else {
          const permissionIndex = networkCache.schemes[eventValues.from].callPermissions
            .findIndex(i =>
              i.asset === eventValues.asset
              && i.to === eventValues.to
              && i.functionSignature === eventValues.functionSignature
            );
          networkCache.schemes[eventValues.from].callPermissions.splice(permissionIndex, 1);
        }
        
      } else {
        console.error('[Scheme does not exist]', eventValues.from);
      }
      
    });
  }
  
  return networkCache;
}

export const updateSchemes = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);

  let controllerEvents = sortEvents(
    await getEvents(allContracts.controller, fromBlock, toBlock, 'allEvents')
  );
  
  for (let controllerEventsIndex = 0; controllerEventsIndex < controllerEvents.length; controllerEventsIndex++) {
    const controllerEvent = controllerEvents[controllerEventsIndex];
    
    const schemeAddress = controllerEvent.returnValues._scheme;
    const walletSchemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
    
    // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
    if (controllerEvent.event == "RegisterScheme") {
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;
      
      console.debug('Adding scheme',schemeTypeData.name);
      
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
      const paramsHash = callsResponse1.decodedReturnData[2];

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
      
      callsToExecute = [
        [
          votingMachine,
          "parameters",
          [paramsHash]
        ]
      ];

      if (schemeTypeData.type == 'WalletScheme') {
        callsToExecute.push([
          votingMachine,
          "boostedVoteRequiredPercentage",
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address), paramsHash]
        ]);
      }

      const callsResponse2 = await executeMulticall(web3, allContracts.multicall, callsToExecute);
      
      const parameters = web3.eth.abi.decodeParameters(
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
        ], callsResponse2.returnData[0]
      );
      
      const boostedVoteRequiredPercentage = (schemeTypeData.type == 'WalletScheme')
        ? web3.eth.abi.decodeParameters(['uint256'], callsResponse2.returnData[1])['0']
        : 0;
    
      if (!networkCache.schemes[schemeAddress]) {
        networkCache.schemes[schemeAddress] = {
          address: schemeAddress,
          registered: true,
          controllerAddress,
          name: schemeName,
          type: schemeTypeData.type,
          ethBalance: ethBalance,
          votingMachine: schemeTypeData.votingMachine,
          
          configurations: [{
            paramsHash: paramsHash,
            // Get and decode the full parameters from the voting machine using teh parametersHash
            parameters: decodeSchemeParameters(parameters),
            // Get and decode the permissions
            permissions,
            boostedVoteRequiredPercentage,
            toBlock: Number.MAX_SAFE_INTEGER
          }],
          
          callPermissions: [],
          proposalIds: [],
          boostedProposals: 0,
          maxSecondsForExecution,
          maxRepPercentageChange,
          newProposalEvents: []
        };
      } else {
        networkCache.schemes[schemeAddress].configurations.push({
          paramsHash: paramsHash,
          // Get and decode the full parameters from the voting machine using teh parametersHash
          parameters: decodeSchemeParameters(parameters),
          // Get and decode the permissions
          permissions,
          boostedVoteRequiredPercentage,
          toBlock: Number.MAX_SAFE_INTEGER
        })
        networkCache.schemes[schemeAddress].configurations[
          networkCache.schemes[schemeAddress].configurations.length - 1
        ].toBlock = controllerEvent.blockNumber;
      }
    
    // Mark scheme as not registered but save all previous data
    } else if (
      controllerEvent.event == "UnregisterScheme" && 
      // This condition is added to skip the first scheme added (that is the dao creator account)
      (controllerEvent.returnValues._sender != schemeAddress)
    ) {
      const schemeTypeData = getSchemeTypeData(networkName, schemeAddress);
      const votingMachine = allContracts.votingMachines[schemeTypeData.votingMachine].contract;

      console.debug('Removing scheme',schemeTypeData.name);
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
      
      const lastConfiguration = networkCache.schemes[schemeAddress].configurations[
        networkCache.schemes[schemeAddress].configurations.length - 1
      ];
      
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
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address), lastConfiguration.paramsHash]
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
      networkCache.schemes[schemeAddress].configurations[
        networkCache.schemes[schemeAddress].configurations.length - 1
      ].boostedVoteRequiredPercentage = boostedVoteRequiredPercentage;
    }

  }));
  
  return networkCache;
};

export const updateProposals = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);
  const avatarAddressEncoded = web3.eth.abi.encodeParameter('address', allContracts.avatar._address)
  
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
    
    while(schemeEvents.length)
    await Promise.all(schemeEvents.splice(0,50 ).map(async (schemeEvent) => {

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
          let creationLogDecoded;
          schemeTypeData.newProposalTopics.map((newProposalTopic, i) => {
            transactionReceipt.logs.map((log) => {
              if (!creationLogDecoded && (log.topics[0] == newProposalTopic[0])) {
                creationLogDecoded = web3.eth.abi.decodeParameters(schemeTypeData.creationLogEncoding[i], log.data)
                if (creationLogDecoded._descriptionHash.length > 0)
                  schemeProposalInfo.descriptionHash = contentHash.fromIpfs(creationLogDecoded._descriptionHash)
              }
              
            })
          })
          } catch (error) {
          console.error('Error on adding content hash from tx', schemeEvent.transactionHash);
        }
      }
      
      let schemeConfigurationAtProposalCreation;
      for (let i = networkCache.schemes[schemeAddress].configurations.length - 1; i >= 0; i--) {
        if (schemeEvent.blockNumber < networkCache.schemes[schemeAddress].configurations[i].toBlock)
          schemeConfigurationAtProposalCreation = networkCache.schemes[schemeAddress].configurations[i]
      }

      // Decode the status texy and pririty that will be given in the dapp
      const { status, priority, boostTime, finishTime } = decodeStatus(
        votingMachineProposalInfo.state.toString(),
        schemeProposalInfo.state.toString(),
        bnum(proposalTimes[0].toString()),
        bnum(proposalTimes[1].toString()),
        bnum(proposalTimes[2].toString()),
        schemeConfigurationAtProposalCreation.parameters.queuedVotePeriodLimit,
        schemeConfigurationAtProposalCreation.parameters.boostedVotePeriodLimit,
        schemeConfigurationAtProposalCreation.parameters.quietEndingPeriod,
        schemeConfigurationAtProposalCreation.parameters.preBoostedVotePeriodLimit,
        false
      );

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
        creationEvent: {
          event: schemeEvent.event,
          signature: schemeEvent.signature,
          address: schemeEvent.address,
          tx: schemeEvent.transactionHash,
          block: schemeEvent.blockNumber,
          transactionIndex: schemeEvent.transactionIndex,
          logIndex: schemeEvent.logIndex
        },
        repAtCreation: bnum(await allContracts.reputation.methods.totalSupplyAt(schemeEvent.blockNumber).call()),
        winningVote: votingMachineProposalInfo.winningVote,
        proposer: votingMachineProposalInfo.proposer,
        currentBoostedVotePeriodLimit: votingMachineProposalInfo.currentBoostedVotePeriodLimit,
        paramsHash: schemeConfigurationAtProposalCreation.paramsHash,
        daoBountyRemain: bnum(votingMachineProposalInfo.daoBountyRemain),
        daoBounty: bnum(votingMachineProposalInfo.daoBounty),
        totalStakes: bnum(votingMachineProposalInfo.totalStakes),
        confidenceThreshold: votingMachineProposalInfo.confidenceThreshold,
        secondsFromTimeOutTillExecuteBoosted: votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted,
        submittedTime: bnum(proposalTimes[0]),
        boostedPhaseTime: bnum(proposalTimes[1]),
        preBoostedPhaseTime: bnum(proposalTimes[2]),
        daoRedeemItsWinnings: votingMachineProposalInfo.daoRedeemItsWinnings,
        status: status,
        priority: priority,
        boostTime: bnum(boostTime),
        finishTime: bnum(finishTime),
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
        block: schemeEvent.blockNumber,
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
    
  }));

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
  
      let schemeConfigurationAtProposalCreation;
      for (let i = networkCache.schemes[schemeAddress].configurations.length - 1; i >= 0; i--) {
        if (networkCache.proposals[proposalId].paramsHash == networkCache.schemes[schemeAddress].configurations[i].paramsHash)
          schemeConfigurationAtProposalCreation = networkCache.schemes[schemeAddress].configurations[i]
      }
  
      // Decode the status texy and pririty that will be given in the dapp
      const { status, priority, boostTime, finishTime } = decodeStatus(
        votingMachineProposalInfo.state.toString(),
        schemeProposalInfo.state.toString(),
        bnum(proposalTimes[0].toString()),
        bnum(proposalTimes[1].toString()),
        bnum(proposalTimes[2].toString()),
        schemeConfigurationAtProposalCreation.parameters.queuedVotePeriodLimit,
        schemeConfigurationAtProposalCreation.parameters.boostedVotePeriodLimit,
        schemeConfigurationAtProposalCreation.parameters.quietEndingPeriod,
        schemeConfigurationAtProposalCreation.parameters.preBoostedVotePeriodLimit,
        proposalShouldBoost
      );
  
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
      networkCache.proposals[proposalId].status = status;
      networkCache.proposals[proposalId].priority = priority;
      networkCache.proposals[proposalId].boostTime = bnum(boostTime);
      networkCache.proposals[proposalId].finishTime = bnum(finishTime);
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
