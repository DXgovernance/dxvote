const hre = require("hardhat");
const { BigNumber } = require('bignumber.js');
const web3 = hre.web3;
const rinkebyContracts = require('../src/config/rinkeby');
const { decodePermission } = require('./helpers/permissions');
const { getEventsBetweenBlocks, sortEvents, decodeSchemeParameters } = require('./helpers/cache');

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
  statusPriority: number;
  boostTime: number;
  finishTime: number;
  shouldBoost: boolean,
  positiveVotes: typeof BigNumber;
  negativeVotes: typeof BigNumber;
  preBoostedPositiveVotes: typeof BigNumber;
  preBoostedNegativeVotes: typeof BigNumber;
  positiveStakes: typeof BigNumber;
  negativeStakes: typeof BigNumber;
  tokenRewards: {[address: string]: boolean};
  repRewards: {[address: string]: boolean};
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
  parametersHash: string;
  controllerAddress: string;
  ethBalance: typeof BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposals: ProposalInfo[];
  proposalIds: string[];
  boostedProposals: number;
  callPermissions: SchemeCallPermission[];
}

interface DaoInfo {
  address: string;
  totalRep: typeof BigNumber;
  ethBalance: typeof BigNumber;
  userEthBalance: typeof BigNumber;
  userRep: typeof BigNumber;
  userVotingMachineTokenBalance: typeof BigNumber;
  userVotingMachineTokenApproved: typeof BigNumber;
}

interface DaoCache {
  daoInfo: DaoInfo
  schemes: {[address: string]: SchemeInfo};
  proposals: {[id: string]: ProposalInfo};
  blockNumber: number;
  votes: Vote[];
  stakes: Stake[];
  redeems: Redeem[];
  redeemsRep: RedeemRep[];
  proposalStateChanges: ProposalStateChange[];
}

// Require the artifacts contracts
const WalletScheme = hre.artifacts.require("WalletScheme");
const PermissionRegistry = hre.artifacts.require("PermissionRegistry");
const DxController = hre.artifacts.require("DxController");
const DxAvatar = hre.artifacts.require("DxAvatar");
const DXDVotingMachine = hre.artifacts.require("DXDVotingMachine");

async function main() {
  // Set block range for the script to run
  const fromBlock = rinkebyContracts.fromBlock;
  const toBlock = await web3.eth.getBlockNumber();
  
  let cache: DaoCache = {
    daoInfo: {} as DaoInfo,
    schemes: {},
    proposals: {},
    blockNumber: toBlock,
    votes: [],
    stakes: [],
    redeems: [],
    redeemsRep: [],
    proposalStateChanges: [],
  };

  // Instantiate the contracts
  const votingMachine = await DXDVotingMachine.at(rinkebyContracts.votingMachine);
  const masterWalletScheme = await WalletScheme.at(rinkebyContracts.masterWalletScheme);
  const quickWalletScheme = await WalletScheme.at(rinkebyContracts.quickWalletScheme);
  const avatar = await DxAvatar.at(rinkebyContracts.avatar);
  const controller = await DxController.at(rinkebyContracts.controller);
  const permissionRegistry = await PermissionRegistry.at(rinkebyContracts.permissionRegistry);

  // Get events from contracts
  let votingMachineEvents = sortEvents( await getEventsBetweenBlocks(votingMachine, fromBlock, toBlock));
  let masterWalletSchemeEvents = sortEvents( await getEventsBetweenBlocks(masterWalletScheme, fromBlock, toBlock));
  let quickWalletSchemeEvents = sortEvents( await getEventsBetweenBlocks(quickWalletScheme, fromBlock, toBlock));
  let controllerEvents = sortEvents( await getEventsBetweenBlocks(controller, fromBlock, toBlock));
  let permissionRegistryEvents = sortEvents( await getEventsBetweenBlocks(permissionRegistry, fromBlock, toBlock));

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
  
  // Get schemes registered and their information in registerScheme events in controller
  let allSchemes: SchemeInfo[] = [];
  await Promise.all(controllerEvents.map(async (controllerEvent) => {
    if (controllerEvent.event == "RegisterScheme") {
      const schemeContract = await WalletScheme.at(controllerEvent.returnValues._scheme);
      const paramsHash = await schemeContract.voteParams.call();
      const controllerAddress = await await schemeContract.controllerAddress.call();
      
      // If controller address is set the permissions are taken using avatar address as sender
      let callPermissions: SchemeCallPermission[] = (controllerAddress == avatar.address)
        ? allCallPermissions[avatar.address] : allCallPermissions[schemeContract.address];
      
      allSchemes.push({
        address: schemeContract.address,
        name: schemeContract.address == rinkebyContracts.masterWalletScheme ? "MasterWalletScheme" : "QuickWalletScheme",
        parametersHash: paramsHash,
        controllerAddress: controllerAddress,
        ethBalance: await web3.eth.getBalance(schemeContract.address),
        parameters: decodeSchemeParameters(
          await await votingMachine.parameters.call(paramsHash)
        ),
        permissions: decodePermission(
          await controller.getSchemePermissions.call(controllerEvent.returnValues._scheme, avatar.address)
        ),
        registered: true,
        proposals: [],
        proposalIds: [],
        boostedProposals: 0,
        callPermissions: callPermissions
      })
    } else if (
      controllerEvent.event == "UnregisterScheme" && 
      (controllerEvent.returnValues._sender != controllerEvent.returnValues._scheme)
    ) {
      allSchemes[allSchemes.findIndex(i => i.address === controllerEvent.returnValues._scheme)].registered = false;
    }
  }));
  console.log(allSchemes);
  
  for (let i = 0; i < allSchemes.length; i++) {
    cache.schemes[allSchemes[i].address] = allSchemes[i];
  }
  // Get all proposals and their latest state
  await Promise.all(masterWalletSchemeEvents.map(async (schemeEvent) => {
    if (schemeEvent.event == "NewCallProposal") {
      console.log(schemeEvent.event)
    }
  }));
  
  // Get all voting machine events
  votingMachineEvents.map((votingMachineEvent) => {
    console.log(votingMachineEvent.event)
    switch (votingMachineEvent.event) {
      case "Vote":
        cache.votes.push({
          voter: votingMachineEvent.returnValues._voter,
          vote: votingMachineEvent.returnValues._vote,
          amount: votingMachineEvent.returnValues._reputation,
          // TO DO: Get the boosted block of the proposal to know if is preBoosted vote
          preBoosted: false,
          proposalId: votingMachineEvent.returnValues._proposalId,
          tx: votingMachineEvent.transactionHash,
          block: votingMachineEvent.blockNumber,
          transactionIndex: votingMachineEvent.transactionIndex,
          logIndex: votingMachineEvent.logIndex
        });
      break;
      case "Stake":
      cache.stakes.push({
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
        cache.redeems.push({
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
        cache.redeemsRep.push({
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
  })
  
  // TO DO: Order voting machine events ?
    
  console.log(votingMachineEvents.length)
  console.log(masterWalletSchemeEvents.length)
  console.log(quickWalletSchemeEvents.length)
  console.log(controllerEvents.length)
  console.log(permissionRegistryEvents.length)
  
  console.log(cache)
} 

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
