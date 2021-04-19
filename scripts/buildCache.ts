const hre = require("hardhat");
const fs = require("fs");
const _ = require("lodash");
const web3 = hre.web3;
const rinkebyContracts = require('../src/config/rinkeby');

const WalletScheme = hre.artifacts.require("WalletScheme");
const PermissionRegistry = hre.artifacts.require("PermissionRegistry");
const DxController = hre.artifacts.require("DxController");
const DxAvatar = hre.artifacts.require("DxAvatar");
const DxReputation = hre.artifacts.require("DxReputation");
const DxToken = hre.artifacts.require("DxToken");
const DXDVotingMachine = hre.artifacts.require("DXDVotingMachine");
const ERC20Mock = hre.artifacts.require("ERC20Mock");
const Multicall = hre.artifacts.require("Multicall");

const fromBlock = rinkebyContracts.fromBlock;
const MAX_BLOCKS_PER_EVENTS_FETCH = 10000;

async function getEventsBetweenBlocks(contract, from, to) {
  let events = [];

  while ((to - from) > MAX_BLOCKS_PER_EVENTS_FETCH) {
    console.debug('Getting events between blocks', contract.address, to - MAX_BLOCKS_PER_EVENTS_FETCH, to);
    events = events.concat(
      await contract.getPastEvents('allEvents', {toBlock: to, fromBlock: (to - MAX_BLOCKS_PER_EVENTS_FETCH)})
    )
    to = to - MAX_BLOCKS_PER_EVENTS_FETCH;
  }
  console.debug('Getting events between blocks', contract.address, from, to, );
  return events.concat(
    await contract.getPastEvents('allEvents', {toBlock: to, fromBlock: from })
  )
}

function sortEvents(events) {
  return _.orderBy( _.uniqBy(events, "id") , ["logIndex", "transactionIndex", "blockNumber"], ["asc","asc","asc"]);
}


async function main() {

  const latestBlock = await web3.eth.getBlockNumber();

  let votingMachineEvents = sortEvents( await getEventsBetweenBlocks(
    await DXDVotingMachine.at(rinkebyContracts.votingMachine), fromBlock, latestBlock
  ));
  let masterWalletSchemeEvents = sortEvents( await getEventsBetweenBlocks(
    await WalletScheme.at(rinkebyContracts.masterWalletScheme), fromBlock, latestBlock
  ));
  let quickWalletSchemeEvents = sortEvents( await getEventsBetweenBlocks(
    await WalletScheme.at(rinkebyContracts.quickWalletScheme), fromBlock, latestBlock
  ));
  
  let controllerEvents = sortEvents( await getEventsBetweenBlocks(
    await DxController.at(rinkebyContracts.controller), fromBlock, latestBlock
  ));
  let reputationEvents = sortEvents( await getEventsBetweenBlocks(
    await DxReputation.at(rinkebyContracts.reputation), fromBlock, latestBlock
  ));


  // get scheme permissions in registerScheme events in controller

  // get scheme parameters configuration in voting machine by parametersHash
  
  // get all proposals and their latest state
  
  // See which proposals are in final state (ExpiredInQueue or Exected)
  
  // Get all missing proposals immutable information (title, description, calls)
  
  console.log(votingMachineEvents)
  console.log(votingMachineEvents.length)
  console.log(masterWalletSchemeEvents.length)
  console.log(quickWalletSchemeEvents.length)
  console.log(controllerEvents.length)
  console.log(reputationEvents.length)
  
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
