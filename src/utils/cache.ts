const _ = require("lodash");
import { bnum, ZERO_ADDRESS } from './helpers';
const { decodePermission } = require('./permissions');
const { decodeSchemeParameters } = require('./scheme');
const { decodeStatus } = require('./proposals');
import { DaoNetworkCache } from '../types';
const WalletSchemeJSON = require('../contracts/WalletScheme');
const { getContracts } = require('../contracts');

const MAX_BLOCKS_PER_EVENTS_FETCH : number = Number(process.env.MAX_BLOCKS_PER_EVENTS_FETCH) || 100000;

export const getEventsBetweenBlocks = async function(contract, from, to, eventsToGet) {
  let events = [];

  while ((to - from) > MAX_BLOCKS_PER_EVENTS_FETCH) {
    events = events.concat(
      await contract.getPastEvents(eventsToGet, {toBlock: to, fromBlock: (to - MAX_BLOCKS_PER_EVENTS_FETCH)})
    );
    to = to - MAX_BLOCKS_PER_EVENTS_FETCH;
  };
  
  return events.concat(
    await contract.getPastEvents(eventsToGet, {toBlock: to, fromBlock: from })
  );
};

export const sortEvents = function(events) {
  return _.orderBy( _.uniqBy(events, "id") , ["blockNumber", "transactionIndex", "logIndex"], ["asc","asc","asc"]);
};

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
  console.debug('[Cache Update]', networkCache, toBlock);

  const firstPromisesRound = await Promise.all([
    updateDaoInfo(networkCache, networkName, web3),
    updateVotingMachineEvents(networkCache, networkName, fromBlock, toBlock, web3),
    updateReputationEvents(networkCache, networkName, fromBlock, toBlock, web3),
    updateDXDEvents(networkCache, networkName, fromBlock, toBlock, web3),
    updateSchemes(networkCache, networkName, fromBlock, toBlock, web3),
  ]);
  
  for (let i = 0; i < firstPromisesRound.length; i++)
    networkCache = firstPromisesRound[i]
    
  const secondPromisesRound = await Promise.all([
    updatePermissionRegistryEvents(networkCache, networkName, fromBlock, toBlock, web3),
    updateProposals(networkCache, networkName, fromBlock, toBlock, web3)
  ]);
  
  for (let i = 0; i < secondPromisesRound.length; i++)
    networkCache = secondPromisesRound[i]
  
  networkCache.blockNumber = Number(toBlock);

  return networkCache;
}

export const updateDaoInfo = async function (
  networkCache: DaoNetworkCache, networkName: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);
  const calls = await executeMulticall(web3, allContracts.multicall, [
    [allContracts.reputation, "totalSupply", []],
    [allContracts.multicall, "getEthBalance", [allContracts.avatar._address]],
    [allContracts.dxd, "balanceOf", [allContracts.avatar._address]]
  ]);
  networkCache.daoInfo.address = allContracts.avatar._address;
  networkCache.daoInfo.repEvents = !networkCache.daoInfo.repEvents ? [] : networkCache.daoInfo.repEvents;
  networkCache.daoInfo.totalRep = bnum(calls.decodedReturnData[0]);
  networkCache.daoInfo.ethBalance = bnum(calls.decodedReturnData[1]);
  networkCache.daoInfo.dxdBalance = bnum(calls.decodedReturnData[2]);
  return networkCache;
}

export const updateVotingMachineEvents = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const { votingMachine } = await getContracts(networkName, web3);

  let votingMachineEvents = sortEvents(
    await getEventsBetweenBlocks(votingMachine, fromBlock, toBlock, 'allEvents')
  );
  votingMachineEvents.map((votingMachineEvent) => {
    switch (votingMachineEvent.event) {
      case "StateChange":
        networkCache.votingMachineEvents.proposalStateChanges.push({
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
        
        const preBoosted = networkCache.votingMachineEvents.proposalStateChanges
          .findIndex(i => i.state === "5") >= 0;

        networkCache.votingMachineEvents.votes.push({
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
      networkCache.votingMachineEvents.stakes.push({
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
        networkCache.votingMachineEvents.redeems.push({
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
        networkCache.votingMachineEvents.redeemsRep.push({
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
  
  return networkCache;
}

export const updateReputationEvents = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const { reputation } = await getContracts(networkName, web3);

  if (!networkCache.daoInfo.repEvents)
    networkCache.daoInfo.repEvents = [];

  let reputationEvents = sortEvents( await getEventsBetweenBlocks(reputation, fromBlock, toBlock, 'allEvents'));
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
            dxdBalance: bnum(0),
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

export const updateDXDEvents = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const { dxd } = await getContracts(networkName, web3);

  let transferDXDEvents = sortEvents( await getEventsBetweenBlocks(dxd, fromBlock, toBlock, 'Transfer'));
  transferDXDEvents.map((transferDXDEvent) => {
    if (!networkCache.users[transferDXDEvent.returnValues.to]) {
      networkCache.users[transferDXDEvent.returnValues.to] = {
        repBalance: bnum(0),
        dxdBalance: bnum(transferDXDEvent.returnValues.value),
        proposalsCreated: []
      }
    } else {
      networkCache.users[transferDXDEvent.returnValues.to].dxdBalance = 
        bnum(networkCache.users[transferDXDEvent.returnValues.to].dxdBalance).plus(transferDXDEvent.returnValues.value)
    }
    
    if (transferDXDEvent.returnValues.from !== ZERO_ADDRESS) {
      networkCache.users[transferDXDEvent.returnValues.from].dxdBalance =
        bnum(networkCache.users[transferDXDEvent.returnValues.from].dxdBalance).minus(transferDXDEvent.returnValues.value)
    }
  });
  
  return networkCache;
}

export const updatePermissionRegistryEvents = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);

  let permissionRegistryEvents = sortEvents(
    await getEventsBetweenBlocks(allContracts.permissionRegistry, fromBlock, toBlock, 'allEvents')
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
  return networkCache;
}

export const updateSchemes = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);

  let controllerEvents = sortEvents(
    await getEventsBetweenBlocks(allContracts.controller, fromBlock, toBlock, 'allEvents')
  );
  
  await Promise.all(controllerEvents.map(async (controllerEvent) => {
    
    const schemeAddress = controllerEvent.returnValues._scheme;
    const schemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
    
    // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
    if (controllerEvent.event == "RegisterScheme") {
      const calls = await executeMulticall(web3, allContracts.multicall, [
        [schemeContract, "voteParams", []],
        [schemeContract, "controllerAddress", []],
        [schemeContract, "schemeName", []],
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [allContracts.controller, "getSchemePermissions", [schemeAddress, allContracts.avatar._address]],
        [schemeContract, "maxSecondsForExecution", []],
      ]);
      const paramsHash = calls.decodedReturnData[0];

      const calls2 = await executeMulticall(web3, allContracts.multicall, [
        [allContracts.votingMachine, "parameters", [paramsHash]],
        [
          allContracts.votingMachine,
          "boostedVoteRequiredPercentage",
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address), paramsHash]
        ]
      ]);

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
        ], calls2.returnData[0]
      );
      
      if (!networkCache.schemes[schemeAddress]) {
        networkCache.schemes[schemeAddress] = {
          address: schemeAddress,
          registered: true,
          controllerAddress: calls.decodedReturnData[1],
          name: calls.decodedReturnData[2],
          ethBalance: calls.decodedReturnData[3],
          
          configurations: [{
            paramsHash: paramsHash,
            // Get and decode the full parameters from the voting machine using teh parametersHash
            parameters: decodeSchemeParameters(parameters),
            // Get and decode the permissions
            permissions: decodePermission(calls.decodedReturnData[4]),
            boostedVoteRequiredPercentage: web3.eth.abi.decodeParameters(['uint256'], calls2.returnData[1])['0'],
            toBlock: Number.MAX_SAFE_INTEGER
          }],
          callPermissions: [],
          proposalIds: [],
          boostedProposals: 0,
          maxSecondsForExecution: calls.decodedReturnData[5],
          newProposalEvents: []
        };
      } else {
        networkCache.schemes[schemeAddress].configurations.push({
          paramsHash: paramsHash,
          // Get and decode the full parameters from the voting machine using teh parametersHash
          parameters: decodeSchemeParameters(parameters),
          // Get and decode the permissions
          permissions: decodePermission(calls.decodedReturnData[4]),
          boostedVoteRequiredPercentage: web3.eth.abi.decodeParameters(['uint256'], calls2.returnData[1])['0'],
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
      (controllerEvent.returnValues._sender != controllerEvent.returnValues._scheme)
    ) {
      const calls = await executeMulticall(web3, allContracts.multicall, [
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [
          allContracts.votingMachine,
          "orgBoostedProposalsCnt", 
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address)]
        ],
        [schemeContract, "maxSecondsForExecution", []]
      ]);
      
      // Update the scheme values a last time
      networkCache.schemes[schemeAddress].ethBalance = calls.decodedReturnData[0];
      networkCache.schemes[schemeAddress].boostedProposals = calls.decodedReturnData[1];
      networkCache.schemes[schemeAddress].maxSecondsForExecution = calls.decodedReturnData[2];
      networkCache.schemes[schemeAddress].registered = false;
    }
    
  }));
  
  // Update registered schemes
  await Promise.all(Object.keys(networkCache.schemes).map(async (schemeAddress) => {
    if (networkCache.schemes[schemeAddress].registered) {
      
      const schemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
      const lastConfiguration = networkCache.schemes[schemeAddress].configurations[
        networkCache.schemes[schemeAddress].configurations.length - 1
      ];
      
      const calls = await executeMulticall(web3, allContracts.multicall, [
        [allContracts.multicall, "getEthBalance", [schemeAddress]],
        [
          allContracts.votingMachine,
          "orgBoostedProposalsCnt", 
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address)]
        ],
        [schemeContract, "maxSecondsForExecution", []],
        [
          allContracts.votingMachine,
          "boostedVoteRequiredPercentage",
          [web3.utils.soliditySha3(schemeAddress, allContracts.avatar._address), lastConfiguration.paramsHash]
        ]
      ]);
      
      networkCache.schemes[schemeAddress].ethBalance = calls.decodedReturnData[0];
      networkCache.schemes[schemeAddress].boostedProposals = calls.decodedReturnData[1];
      networkCache.schemes[schemeAddress].maxSecondsForExecution = calls.decodedReturnData[2];
      networkCache.schemes[schemeAddress].configurations[
        networkCache.schemes[schemeAddress].configurations.length - 1
      ].boostedVoteRequiredPercentage = web3.eth.abi.decodeParameters(['uint256'], calls.returnData[3])['0']
    }

  }));
  
  return networkCache;
};

export const updateProposals = async function (
  networkCache: DaoNetworkCache, networkName: string, fromBlock: string, toBlock: string, web3: any
): Promise<DaoNetworkCache> {
  const allContracts = await getContracts(networkName, web3);

  // Get new proposals
  await Promise.all(Object.keys(networkCache.schemes).map(async (schemeAddress) => {

    const schemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);

    const schemeEvents = sortEvents( await getEventsBetweenBlocks(schemeContract, fromBlock, toBlock, 'NewCallProposal'))
    await Promise.all(schemeEvents.map(async (schemeEvent) => {

      if (schemeEvent.event == "NewCallProposal") {
        const proposalId = schemeEvent.returnValues._proposalId;
        
        // Get all the proposal information from the scheme and voting machine
        const calls = await executeMulticall(web3, allContracts.multicall, [
          [ schemeContract, "getOrganizationProposal", [proposalId] ],
          [ allContracts.votingMachine, "proposals", [proposalId] ],
          [ allContracts.votingMachine, "proposalStatusWithVotes", [proposalId] ],
          [ allContracts.votingMachine, "getProposalTimes", [proposalId] ],
          [ allContracts.votingMachine, "shouldBoost", [proposalId] ],
        ]);
        const schemeProposalInfo = web3.eth.abi.decodeParameters(
          [ 
            {type: 'address[]', name: 'to' },
            {type: 'bytes[]', name: 'callData' },
            {type: 'uint256[]', name: 'value' },
            {type: 'uint256', name: 'state' },
            {type: 'string', name: 'title' },
            {type: 'string', name: 'descriptionHash' },
            {type: 'uint256', name: 'submittedTime' }
          ],
          calls.returnData[0]
        );
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
          calls.returnData[1]
        );
        const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
          ['uint256','uint256','uint256','uint256','uint256','uint256'], 
          calls.returnData[2]
        );
        const proposalTimes = calls.decodedReturnData[3];
        const proposalShouldBoost = calls.decodedReturnData[4];
        
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
          proposalShouldBoost
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
          shouldBoost: proposalShouldBoost,
          positiveVotes: bnum(proposalStatusWithVotes[0]),
          negativeVotes: bnum(proposalStatusWithVotes[1]),
          preBoostedPositiveVotes: bnum(proposalStatusWithVotes[2]),
          preBoostedNegativeVotes: bnum(proposalStatusWithVotes[3]),
          positiveStakes: bnum(proposalStatusWithVotes[4]),
          negativeStakes: bnum(proposalStatusWithVotes[5])
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
        
        // Save proposal created in users
        if (!networkCache.users[votingMachineProposalInfo.proposer]) {
          networkCache.users[votingMachineProposalInfo.proposer] = {
            repBalance: bnum(0),
            dxdBalance: bnum(0),
            proposalsCreated: [proposalId]
          }
        } else {
          networkCache.users[votingMachineProposalInfo.proposer].proposalsCreated.push(proposalId);
        }

      }
    }));
    
  }));
  
  // Update existent active proposals
  await Promise.all(Object.keys(networkCache.proposals).map(async (proposalId) => {
    
    if (networkCache.proposals[proposalId].status !== "Expired in Queue"
      &&  networkCache.proposals[proposalId].status !== "Execution Failed"
      &&  networkCache.proposals[proposalId].status !== "Execution Succeded"
      &&  networkCache.proposals[proposalId].status !== "Passed"
    ) {
      
      const schemeAddress = networkCache.proposals[proposalId].scheme;
      const schemeContract = await new web3.eth.Contract(WalletSchemeJSON.abi, schemeAddress);
      
      // Get all the proposal information from the scheme and voting machine
      const calls = await executeMulticall(web3, allContracts.multicall, [
        [ schemeContract, "getOrganizationProposal", [proposalId] ],
        [ allContracts.votingMachine, "proposals", [proposalId] ],
        [ allContracts.votingMachine, "proposalStatusWithVotes", [proposalId] ],
        [ allContracts.votingMachine, "getProposalTimes", [proposalId] ],
        [ allContracts.votingMachine, "shouldBoost", [proposalId] ],
      ]);
      const schemeProposalInfo = web3.eth.abi.decodeParameters(
        [ 
          {type: 'address[]', name: 'to' },
          {type: 'bytes[]', name: 'callData' },
          {type: 'uint256[]', name: 'value' },
          {type: 'uint256', name: 'state' },
          {type: 'string', name: 'title' },
          {type: 'string', name: 'descriptionHash' },
          {type: 'uint256', name: 'submittedTime' }
        ],
        calls.returnData[0]
      );
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
        calls.returnData[1]
      );
      const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
        ['uint256','uint256','uint256','uint256','uint256','uint256'], 
        calls.returnData[2]
      );
      const proposalTimes = calls.decodedReturnData[3];
      const proposalShouldBoost = calls.decodedReturnData[4];
      
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
      networkCache.proposals[proposalId].positiveVotes = bnum(proposalStatusWithVotes[0]);
      networkCache.proposals[proposalId].negativeVotes = bnum(proposalStatusWithVotes[1]);
      networkCache.proposals[proposalId].preBoostedPositiveVotes = bnum(proposalStatusWithVotes[2]);
      networkCache.proposals[proposalId].preBoostedNegativeVotes = bnum(proposalStatusWithVotes[3]);
      networkCache.proposals[proposalId].positiveStakes = bnum(proposalStatusWithVotes[4]);
      networkCache.proposals[proposalId].negativeStakes = bnum(proposalStatusWithVotes[5]);
      
      // Save proposal created in users if not saved already
      if (!networkCache.users[networkCache.proposals[proposalId].proposer]) {
        networkCache.users[networkCache.proposals[proposalId].proposer] = {
          repBalance: bnum(0),
          dxdBalance: bnum(0),
          proposalsCreated: [proposalId]
        }
      } else if (networkCache.users[networkCache.proposals[proposalId].proposer].proposalsCreated.indexOf(proposalId) < 0) {
        networkCache.users[networkCache.proposals[proposalId].proposer].proposalsCreated.push(proposalId);
      }
      
    }

  }));
  
  return networkCache;
};
