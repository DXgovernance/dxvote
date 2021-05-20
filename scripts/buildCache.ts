const fs = require("fs");
const hre = require("hardhat");
const { BigNumber } = require('bignumber.js');
const web3 = hre.web3;
const { getConfig } = require('../src/config');
const { decodePermission } = require('../src/utils/permissions');
const { getEventsBetweenBlocks, sortEvents } = require('../src/utils/cache');
const { decodeSchemeParameters } = require('../src/utils/scheme');
const { decodeStatus } = require('../src/utils/proposals');

import { DaoCache, DaoInfo } from '../src/types';

// Require the artifacts contracts
const WalletScheme = hre.artifacts.require("WalletScheme");
const PermissionRegistry = hre.artifacts.require("PermissionRegistry");
const DxController = hre.artifacts.require("DxController");
const DxAvatar = hre.artifacts.require("DxAvatar");
const DxReputation = hre.artifacts.require("DxReputation");
const DXDVotingMachine = hre.artifacts.require("DXDVotingMachine");
const ERC20 = hre.artifacts.require("ERC20");

async function main() {
  
  // Initializing cache based on stored cache file and network used, if used localhost the cache is always restarted
  const networkName = hre.network.name;
  const contractsConfig = getConfig(networkName);
  
  let cacheFile: DaoCache = fs.existsSync('./src/cache.json')
    ? JSON.parse(fs.readFileSync('./src/cache.json', 'utf-8'))
    : {
      [networkName] : {
        blockNumber: contractsConfig.fromBlock,
        daoInfo: {} as DaoInfo,
        schemes: {},
        proposals: {},
        callPermissions: {},
        votingMachineEvents: {
          votes: [],
          stakes: [],
          redeems: [],
          redeemsRep: [],
          proposalStateChanges: []
        }
      }
    };
    
  const cache = (!cacheFile[networkName])
    ? {
      blockNumber: networkName != 'localhost' ? contractsConfig.fromBlock : 1,
      daoInfo: {} as DaoInfo,
      schemes: {},
      proposals: {},
      callPermissions: {},
      votingMachineEvents: {
        votes: [],
        stakes: [],
        redeems: [],
        redeemsRep: [],
        proposalStateChanges: []
      }
    } : (networkName == 'localhost') ?
    {
      blockNumber: 1,
      daoInfo: {} as DaoInfo,
      schemes: {},
      proposals: {},
      callPermissions: {},
      votingMachineEvents: {
        votes: [],
        stakes: [],
        redeems: [],
        redeemsRep: [],
        proposalStateChanges: []
      }
    } : cacheFile[networkName];
  
  // Set block range for the script to run
  const fromBlock = cache.blockNumber;
  const toBlock = await web3.eth.getBlockNumber();
  cache.blockNumber = toBlock;
  
  console.log('Runing cache script from block', fromBlock, 'to block', toBlock, 'in network', networkName);
  
  // Instantiate the contracts
  const votingMachine = await DXDVotingMachine.at(contractsConfig.votingMachine);
  const avatar = await DxAvatar.at(contractsConfig.avatar);
  const controller = await DxController.at(contractsConfig.controller);
  const reputation = await DxReputation.at(contractsConfig.reputation);
  const permissionRegistry = await PermissionRegistry.at(contractsConfig.permissionRegistry);
  const dxd = await ERC20.at(await votingMachine.stakingToken.call());
  
  // Update DaoInfo
  cache.daoInfo.address = contractsConfig.avatar;
  cache.daoInfo.totalRep = new BigNumber(await reputation.totalSupply.call());
  cache.daoInfo.repEvents = !cache.daoInfo.repEvents ? [] : cache.daoInfo.repEvents;
  cache.daoInfo.ethBalance = new BigNumber(await web3.eth.getBalance(contractsConfig.avatar));
  cache.daoInfo.dxdBalance = new BigNumber(await dxd.balanceOf.call(contractsConfig.avatar));
  cache.daoInfo.repHolders = !cache.daoInfo.repHolders ? {} : cache.daoInfo.repHolders;

  // Get events from contracts
  let votingMachineEvents = sortEvents( await getEventsBetweenBlocks(votingMachine, fromBlock, toBlock));
  let controllerEvents = sortEvents( await getEventsBetweenBlocks(controller, fromBlock, toBlock));
  let permissionRegistryEvents = sortEvents( await getEventsBetweenBlocks(permissionRegistry, fromBlock, toBlock));
  let reputationEvents = sortEvents( await getEventsBetweenBlocks(reputation, fromBlock, toBlock));

  // Get all call permissions (up to date) to later be added in schemes
  permissionRegistryEvents.map((permissionRegistryEvent) => {
    const eventValues = permissionRegistryEvent.returnValues;
    
    if (!cache.callPermissions[eventValues.from])
      cache.callPermissions[eventValues.from] = [];
    
    if (eventValues.value != 0 && eventValues.fromTime != 0) {
      cache.callPermissions[eventValues.from].push({
        asset: eventValues.asset,
        to: eventValues.to,
        functionSignature: eventValues.functionSignature,
        value: eventValues.value,
        fromTime: eventValues.fromTime
      })
    } else {
      const permissionIndex = cache.callPermissions[eventValues.from].findIndex(i => i.asset === eventValues.asset && i.to === eventValues.to);
      cache.callPermissions[eventValues.from].splice(permissionIndex, 1);
    }
    
  });
    
  // Get all schemes and their information in registerScheme events in controller
  await Promise.all(controllerEvents.map(async (controllerEvent) => {
    
    // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
    if (controllerEvent.event == "RegisterScheme") {
      const schemeContract = await WalletScheme.at(controllerEvent.returnValues._scheme);
      const paramsHash = await schemeContract.voteParams.call();
      const controllerAddress = await schemeContract.controllerAddress.call();
            
      cache.schemes[schemeContract.address] = {
        registered: true,
        address: schemeContract.address,
        name: await schemeContract.schemeName.call(),
        paramsHash: paramsHash,
        controllerAddress: controllerAddress,
        ethBalance: await web3.eth.getBalance(schemeContract.address),
        
        // Get and decode the full parameters from the voting machine using teh parametersHash
        parameters: decodeSchemeParameters(
          await await votingMachine.parameters.call(paramsHash)
        ),
        
        // Get and decode the permissions
        permissions: decodePermission(
          await controller.getSchemePermissions.call(controllerEvent.returnValues._scheme, avatar.address)
        ),
        
        proposalIds: [],
        boostedProposals: await votingMachine.orgBoostedProposalsCnt.call(
          web3.utils.soliditySha3(schemeContract.address, avatar.address)
        ),
        maxSecondsForExecution: await schemeContract.maxSecondsForExecution.call()
      };
    
    // Mark scheme as not registered but save all previous data
    } else if (
      controllerEvent.event == "UnregisterScheme" && 
      // This condition is added to skip the first scheme added (that is the dao creator account)
      (controllerEvent.returnValues._sender != controllerEvent.returnValues._scheme)
    ) {
      cache.schemes[controllerEvent.returnValues._scheme].registered = false;
    }
    
  }));
  
  
  // Get all proposals information
  await Promise.all(Object.keys(cache.schemes).map(async (schemeAddress) => {

    const schemeContract = await WalletScheme.at(schemeAddress);

    const schemeEvents = sortEvents( await getEventsBetweenBlocks(schemeContract, fromBlock, toBlock))
    await Promise.all(schemeEvents.map(async (schemeEvent) => {

      if (schemeEvent.event == "NewCallProposal") {
        
        // Get all the proposal information from the scheme and voting machine
        const proposalId = schemeEvent.returnValues._proposalId;
        const schemeProposalInfo = await schemeContract.getOrganizationProposal.call(proposalId);
        const votingMachineProposalInfo = await votingMachine.proposals.call(proposalId);
        const proposalStatusWithVotes = await votingMachine.proposalStatusWithVotes.call(proposalId);
        const proposalTimes = await votingMachine.getProposalTimes.call(proposalId);
        const proposalShouldBoost = await votingMachine.shouldBoost.call(proposalId);

        // Decode the status texy and pririty that will be given in the dapp
        const { status, priority, boostTime, finishTime } = decodeStatus(
          votingMachineProposalInfo.state.toString(),
          schemeProposalInfo.state.toString(),
          new BigNumber(proposalTimes[0].toString()),
          new BigNumber(proposalTimes[1].toString()),
          new BigNumber(proposalTimes[2].toString()),
          cache.schemes[schemeContract.address].parameters.queuedVotePeriodLimit,
          cache.schemes[schemeContract.address].parameters.boostedVotePeriodLimit,
          cache.schemes[schemeContract.address].parameters.quietEndingPeriod,
          cache.schemes[schemeContract.address].parameters.preBoostedVotePeriodLimit,
          proposalShouldBoost
        );
        
        cache.proposals[proposalId] = {
          id: proposalId,
          scheme: schemeContract.address,
          to: schemeProposalInfo.to,
          title: schemeProposalInfo.title,
          callData: schemeProposalInfo.callData,
          values: schemeProposalInfo.value.map((value) => new BigNumber(value)),
          stateInScheme: schemeProposalInfo.state,
          stateInVotingMachine: votingMachineProposalInfo.state,
          descriptionHash: schemeProposalInfo.descriptionHash,
          creationBlock: schemeEvent.blockNumber,
          repAtCreation: new BigNumber(await reputation.totalSupplyAt.call(schemeEvent.blockNumber)),
          winningVote: votingMachineProposalInfo.winningVote,
          proposer: votingMachineProposalInfo.proposer,
          currentBoostedVotePeriodLimit: votingMachineProposalInfo.currentBoostedVotePeriodLimit,
          paramsHash: cache.schemes[schemeContract.address].paramsHash,
          daoBountyRemain: new BigNumber(votingMachineProposalInfo.daoBountyRemain),
          daoBounty: new BigNumber(votingMachineProposalInfo.daoBounty),
          totalStakes: new BigNumber(votingMachineProposalInfo.totalStakes),
          confidenceThreshold: votingMachineProposalInfo.confidenceThreshold,
          secondsFromTimeOutTillExecuteBoosted: votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted,
          submittedTime: new BigNumber(proposalTimes[0]),
          boostedPhaseTime: new BigNumber(proposalTimes[1]),
          preBoostedPhaseTime: new BigNumber(proposalTimes[2]),
          daoRedeemItsWinnings: votingMachineProposalInfo.daoRedeemItsWinnings,
          status: status,
          priority: priority,
          boostTime: new BigNumber(boostTime),
          finishTime: new BigNumber(finishTime),
          shouldBoost: proposalShouldBoost,
          positiveVotes: new BigNumber(proposalStatusWithVotes[0]),
          negativeVotes: new BigNumber(proposalStatusWithVotes[1]),
          preBoostedPositiveVotes: new BigNumber(proposalStatusWithVotes[2]),
          preBoostedNegativeVotes: new BigNumber(proposalStatusWithVotes[3]),
          positiveStakes: new BigNumber(proposalStatusWithVotes[4]),
          negativeStakes: new BigNumber(proposalStatusWithVotes[5])
        };
        cache.schemes[schemeContract.address].proposalIds.push(proposalId);
      }
    }));
    
  }));
  
  // Get all votes, stakes, redeems and redeems rep form voting machine events
  votingMachineEvents.map((votingMachineEvent) => {
    switch (votingMachineEvent.event) {
      case "StateChange":
        cache.votingMachineEvents.proposalStateChanges.push({
          state: votingMachineEvent.returnValues._proposalState,
          proposalId: votingMachineEvent.returnValues._proposalId,
          tx: votingMachineEvent.transactionHash,
          block: votingMachineEvent.blockNumber,
          transactionIndex: votingMachineEvent.transactionIndex,
          logIndex: votingMachineEvent.logIndex
        });
      break;
      case "VoteProposal":
        
        const preBoosted = cache.votingMachineEvents.proposalStateChanges
          .findIndex(i => i.state === "5") >= 0;

        cache.votingMachineEvents.votes.push({
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
      cache.votingMachineEvents.stakes.push({
          staker: votingMachineEvent.returnValues._staker,    
          vote: votingMachineEvent.returnValues._vote,
          amount: votingMachineEvent.returnValues._amount,
          amount4Bounty: new BigNumber("0"),
          proposalId: votingMachineEvent.returnValues._proposalId,
          tx: votingMachineEvent.transactionHash,
          block: votingMachineEvent.blockNumber,
          transactionIndex: votingMachineEvent.transactionIndex,
          logIndex: votingMachineEvent.logIndex
        });
      break;
      case "Redeem":
        cache.votingMachineEvents.redeems.push({
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
        cache.votingMachineEvents.redeemsRep.push({
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
  
  // Store all the rep holders balances up to date
  reputationEvents.map((reputationEvent) => {
    switch (reputationEvent.event) {
      case "Mint":
        cache.daoInfo.repEvents.push({
          type: "Mint",
          account: reputationEvent.returnValues._to,
          amount: new BigNumber(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          block: reputationEvent.blockNumber,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex
        });
        cache.daoInfo.repHolders[reputationEvent.returnValues._to] = 
          !cache.daoInfo.repHolders[reputationEvent.returnValues._to]
            ? new BigNumber(reputationEvent.returnValues._amount)
            : new BigNumber(cache.daoInfo.repHolders[reputationEvent.returnValues._to])
              .plus(reputationEvent.returnValues._amount)
      break;
      case "Burn":
        cache.daoInfo.repEvents.push({
          type: "Burn",
          account: reputationEvent.returnValues._from,
          amount: new BigNumber(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          block: reputationEvent.blockNumber,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex
        });
        cache.daoInfo.repHolders[reputationEvent.returnValues._from] =
          new BigNumber(cache.daoInfo.repHolders[reputationEvent.returnValues._from])
            .minus(reputationEvent.returnValues._amount)
      break;
    }
  })
  
  cacheFile[networkName] = cache;
  fs.writeFileSync("./src/cache.json", JSON.stringify(cacheFile, null, 2), { encoding: "utf8", flag: "w" });

} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
