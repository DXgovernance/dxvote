const hre = require("hardhat");
const { BigNumber } = require('bignumber.js');
const web3 = hre.web3;
const rinkebyContracts = require('../src/config/rinkeby');
const { decodePermission } = require('./helpers/permissions');
const { getEventsBetweenBlocks, sortEvents, decodeSchemeParameters, decodeStatus } = require('./helpers/cache');

// The only way I found to import the types from the source folder into here was by copy/pasting
// TO DO: Use the interfaces imported the source folder

interface VotingMachineEvent {
  proposalId: string;
  tx: string;
  block: number;
  transactionIndex: number;
  logIndex: number;
}

interface Vote extends VotingMachineEvent {
  voter: string;
  vote: number;
  amount: typeof BigNumber;
  preBoosted: boolean;
}

interface Stake extends VotingMachineEvent {
  staker: string;
  amount: typeof BigNumber;
  vote: number;
  amount4Bounty: typeof BigNumber;
}

interface ProposalStateChange extends VotingMachineEvent {
  state: string;
}

interface Redeem extends VotingMachineEvent {
  beneficiary: string;
  amount: typeof BigNumber;
}

interface RedeemRep extends VotingMachineEvent {
  beneficiary: string;
  amount: typeof BigNumber;
}

enum SchemeProposalState { Submitted, Passed, Failed, Executed }

enum VotingMachineProposalState { 
  None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod
}

interface ProposalInfo {
  id: string;
  scheme: string;
  title: string;
  to: string[];
  callData: string[];
  values: typeof BigNumber[];
  stateInScheme: SchemeProposalState;
  stateInVotingMachine: VotingMachineProposalState;
  descriptionHash: string;
  creationBlock: typeof BigNumber;
  repAtCreation: typeof BigNumber;
  winningVote: number;
  proposer: string;
  currentBoostedVotePeriodLimit: typeof BigNumber;
  paramsHash: string;
  daoBountyRemain: typeof BigNumber;
  daoBounty: typeof BigNumber;
  totalStakes: typeof BigNumber;
  confidenceThreshold: typeof BigNumber;
  secondsFromTimeOutTillExecuteBoosted: typeof BigNumber;
  submittedTime: typeof BigNumber;
  boostedPhaseTime: typeof BigNumber;
  preBoostedPhaseTime: typeof BigNumber;
  daoRedeemItsWinnings: boolean;
  status: string;
  priority: number;
  boostTime: number;
  finishTime: number;
  shouldBoost: boolean,
  positiveVotes: typeof BigNumber;
  negativeVotes: typeof BigNumber;
  preBoostedPositiveVotes: typeof BigNumber;
  preBoostedNegativeVotes: typeof BigNumber;
  positiveStakes: typeof BigNumber;
  negativeStakes: typeof BigNumber;
}

interface SchemeParameters {
  queuedVoteRequiredPercentage: typeof BigNumber;
  queuedVotePeriodLimit: typeof BigNumber;
  boostedVotePeriodLimit: typeof BigNumber;
  preBoostedVotePeriodLimit: typeof BigNumber;
  thresholdConst: typeof BigNumber;
  limitExponentValue: typeof BigNumber;
  quietEndingPeriod: typeof BigNumber;
  proposingRepReward: typeof BigNumber;
  votersReputationLossRatio: typeof BigNumber;
  minimumDaoBounty: typeof BigNumber;
  daoBountyConst: typeof BigNumber;
  activationTime: typeof BigNumber;
}

interface SchemePermissions {
  canGenericCall: boolean;
  canUpgrade: boolean;
  canChangeConstraints: boolean;
  canRegisterSchemes: boolean;
}

interface SchemeCallPermission {
  asset: string;
  to: string;
  functionSignature: string;
  fromTime: typeof BigNumber;
  value: typeof BigNumber;
}

interface SchemeInfo {
  registered: boolean;
  address: string;
  name: string,
  paramsHash: string;
  controllerAddress: string;
  ethBalance: typeof BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposalIds: string[];
  callPermissions: SchemeCallPermission[];
}

interface DaoInfo {
  address: string;
  totalRep: typeof BigNumber;
  repHolders: {[id: string]: typeof BigNumber};
  ethBalance: typeof BigNumber;
  dxdBalance: typeof BigNumber;
  boostedProposals: number;
}

interface DaoCache {
  blockNumber: number;
  daoInfo: DaoInfo
  schemes: {[address: string]: SchemeInfo};
  proposals: {[id: string]: ProposalInfo};
  votingMachineEvents: {
    votes: Vote[];
    stakes: Stake[];
    redeems: Redeem[];
    redeemsRep: RedeemRep[];
    proposalStateChanges: ProposalStateChange[];
  }
}

// Require the artifacts contracts
const WalletScheme = hre.artifacts.require("WalletScheme");
const PermissionRegistry = hre.artifacts.require("PermissionRegistry");
const DxController = hre.artifacts.require("DxController");
const DxAvatar = hre.artifacts.require("DxAvatar");
const DxReputation = hre.artifacts.require("DxReputation");
const DXDVotingMachine = hre.artifacts.require("DXDVotingMachine");
const ERC20 = hre.artifacts.require("ERC20");

async function main() {
  // Set block range for the script to run
  const fromBlock = rinkebyContracts.fromBlock;
  const toBlock = await web3.eth.getBlockNumber();
  
  console.log('Runnig build cche script from block', fromBlock, ' to block', toBlock);
  
  // Instantiate the contracts
  const votingMachine = await DXDVotingMachine.at(rinkebyContracts.votingMachine);
  const avatar = await DxAvatar.at(rinkebyContracts.avatar);
  const controller = await DxController.at(rinkebyContracts.controller);
  const reputation = await DxReputation.at(rinkebyContracts.reputation);
  const permissionRegistry = await PermissionRegistry.at(rinkebyContracts.permissionRegistry);
  const dxd = await ERC20.at(rinkebyContracts.votingMachineToken);
  
  let cache: DaoCache = {
    blockNumber: toBlock,
    daoInfo: {} as DaoInfo,
    schemes: {},
    proposals: {},
    votingMachineEvents: {
      votes: [],
      stakes: [],
      redeems: [],
      redeemsRep: [],
      proposalStateChanges: []
    }
  };
  
  // Update DaoInfo
  cache.daoInfo.address = rinkebyContracts.avatar;
  cache.daoInfo.totalRep = await reputation.totalSupply.call();
  cache.daoInfo.ethBalance = new BigNumber(await web3.eth.getBalance(rinkebyContracts.avatar));
  cache.daoInfo.dxdBalance = await dxd.balanceOf.call(rinkebyContracts.avatar);
  cache.daoInfo.boostedProposals = await votingMachine.orgBoostedProposalsCnt.call(rinkebyContracts.avatar);
  cache.daoInfo.repHolders = !cache.daoInfo.repHolders ? {} : cache.daoInfo.repHolders;

  // Get events from contracts
  let votingMachineEvents = sortEvents( await getEventsBetweenBlocks(votingMachine, fromBlock, toBlock));
  let controllerEvents = sortEvents( await getEventsBetweenBlocks(controller, fromBlock, toBlock));
  let permissionRegistryEvents = sortEvents( await getEventsBetweenBlocks(permissionRegistry, fromBlock, toBlock));
  let reputationEvents = sortEvents( await getEventsBetweenBlocks(reputation, fromBlock, toBlock));

  // Get all call permissions (up to date) to later be added in schemes
  let allCallPermissions: {[from: string]: SchemeCallPermission[]} = {};

  await Promise.all(permissionRegistryEvents.map(async (permissionRegistryEvent) => {
    const eventValues = permissionRegistryEvent.returnValues;
    
    if (!allCallPermissions[eventValues.from])
      allCallPermissions[eventValues.from] = [];
    
    if (eventValues.value != 0 && eventValues.fromTime != 0) {
      allCallPermissions[eventValues.from].push({
        asset: eventValues.asset,
        to: eventValues.to,
        functionSignature: eventValues.functionSignature,
        value: eventValues.value,
        fromTime: eventValues.fromTime
      })
    } else {
      const permissionIndex = allCallPermissions[eventValues.from].findIndex(i => i.asset === eventValues.asset && i.to === eventValues.to);
      allCallPermissions[eventValues.from].splice(permissionIndex, 1);
    }
    
  }));
    
  // Get all schemes and their information in registerScheme events in controller
  await Promise.all(controllerEvents.map(async (controllerEvent) => {
    
    // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
    if (controllerEvent.event == "RegisterScheme") {
      const schemeContract = await WalletScheme.at(controllerEvent.returnValues._scheme);
      const paramsHash = await schemeContract.voteParams.call();
      const controllerAddress = await schemeContract.controllerAddress.call();
      
      // If controller address is set the permissions are taken using avatar address as sender
      let callPermissions: SchemeCallPermission[] = (controllerAddress == controller.address)
        ? allCallPermissions[avatar.address] : allCallPermissions[schemeContract.address];
      
      cache.schemes[schemeContract.address] = {
        registered: true,
        address: schemeContract.address,
        name: schemeContract.address == rinkebyContracts.masterWalletScheme ? "MasterWalletScheme" : "QuickWalletScheme",
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
        callPermissions: callPermissions
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
        
        // Decode teh status texy and pririty that will be given in the dapp
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
          values: schemeProposalInfo.value,
          stateInScheme: schemeProposalInfo.state,
          stateInVotingMachine: votingMachineProposalInfo.state,
          descriptionHash: schemeProposalInfo.descriptionHash,
          creationBlock: schemeEvent.blockNumber,
          repAtCreation: await reputation.totalSupplyAt.call(schemeEvent.blockNumber),
          winningVote: votingMachineProposalInfo.winningVote,
          proposer: votingMachineProposalInfo.proposer,
          currentBoostedVotePeriodLimit: votingMachineProposalInfo.currentBoostedVotePeriodLimit,
          paramsHash: cache.schemes[schemeContract.address].paramsHash,
          daoBountyRemain: votingMachineProposalInfo.daoBountyRemain,
          daoBounty: votingMachineProposalInfo.daoBounty,
          totalStakes: votingMachineProposalInfo.totalStakes,
          confidenceThreshold: votingMachineProposalInfo.confidenceThreshold,
          secondsFromTimeOutTillExecuteBoosted: votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted,
          submittedTime: new BigNumber(proposalTimes[0].toString()),
          boostedPhaseTime: new BigNumber(proposalTimes[1].toString()),
          preBoostedPhaseTime: new BigNumber(proposalTimes[2].toString()),
          daoRedeemItsWinnings: votingMachineProposalInfo.daoRedeemItsWinnings,
          status: status,
          priority: priority,
          boostTime: boostTime,
          finishTime: finishTime,
          shouldBoost: proposalShouldBoost,
          positiveVotes: proposalStatusWithVotes[0],
          negativeVotes: proposalStatusWithVotes[1],
          preBoostedPositiveVotes: proposalStatusWithVotes[2],
          preBoostedNegativeVotes: proposalStatusWithVotes[3],
          positiveStakes: proposalStatusWithVotes[4],
          negativeStakes: proposalStatusWithVotes[5]
        };
      }
    }));
    
  }));
  
  // Get all votes, stakes, redeems and redeems rep form voting machine events
  votingMachineEvents.map(async (votingMachineEvent) => {
    switch (votingMachineEvent.event) {
      case "Vote":
        const preBoosted = await web3.eth.getBlock(votingMachineEvent.blockNumber).timestamp <
          cache.proposals[votingMachineEvent.returnValues._proposalId].boostTime;
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
        cache.daoInfo.repHolders[reputationEvent.returnValues._to] = 
          !cache.daoInfo.repHolders[reputationEvent.returnValues._to] ? reputationEvent.returnValues._amount
          : cache.daoInfo.repHolders[reputationEvent.returnValues._to].plus(reputationEvent.returnValues._amount)
      break;
      case "Burn":
        cache.daoInfo.repHolders[reputationEvent.returnValues._to] =
          cache.daoInfo.repHolders[reputationEvent.returnValues._to].plus(reputationEvent.returnValues._amount)
      break;
    }
  })
  
  console.log(cache)
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
