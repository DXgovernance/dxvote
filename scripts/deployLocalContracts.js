const hre = require("hardhat");
const fs = require("fs");
const web3 = hre.web3;
var moment = require("moment");
const { encodePermission } = require('./helpers/permissions');
const IPFS = require('ipfs-core');
const contentHash = require('content-hash');
const request = require("request-promise-native");
const repHolders = require('../.repHolders.json');

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_UINT_256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const ANY_ADDRESS = "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa";
const ANY_FUNC_SIGNATURE = "0xaaaaaaaa";

const delay = time => new Promise(res=>setTimeout(res,time));

const WalletScheme = artifacts.require("WalletScheme");
const PermissionRegistry = artifacts.require("PermissionRegistry");
const DxController = artifacts.require("DxController");
const DxAvatar = artifacts.require("DxAvatar");
const DxReputation = artifacts.require("DxReputation");
const DxToken = artifacts.require("DxToken");
const DXDVotingMachine = artifacts.require("DXDVotingMachine");
const ERC20Mock = artifacts.require("ERC20Mock");
const Multicall = artifacts.require("Multicall");

async function main() {
    
  const accounts = await web3.eth.getAccounts();
  const GAS_LIMIT = 9000000;
  const votingMachineToken = await ERC20Mock.new(accounts[0], web3.utils.toWei("1000"));
  
  // Deploy Reputation
  const reputation = await DxReputation.new();
  await reputation.mint(accounts[0], 100);
  
  // Deploy empty token
  console.log('Deploying DxToken...');
  const token = await DxToken.new("", "", 0, {gas: GAS_LIMIT});

  // Deploy Avatar
  console.log('Deploying DxAvatar...');
  const avatar = await DxAvatar.new("DXdao", token.address, reputation.address, {gas: GAS_LIMIT});

  // Deploy controller and transfer avatar to controller
  console.log('Deploying DxController...');
  const controller = await DxController.new(avatar.address, {gas: GAS_LIMIT});
  
  // Transfer reputation adn avatar to controller
  await reputation.transferOwnership(controller.address);
  await avatar.transferOwnership(controller.address);
  await token.transferOwnership(controller.address);

  const dxdVotingMachine = await DXDVotingMachine.new(votingMachineToken.address, {gas: GAS_LIMIT});
  const multicall = await Multicall.new();
  
  var permissionRegistry = await PermissionRegistry.new(
    accounts[0], moment.duration(1, 'hours').asSeconds(), { gas: 1000000 }
  );
  
  const schemesConfiguration = (network == 'rinkeby') ? {
    master: {
      queuedVoteRequiredPercentage: 50,
      queuedVotePeriodLimit: moment.duration(90, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(30, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      thresholdConst: 1500,
      quietEndingPeriod: moment.duration(3, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.02"),
      votersReputationLossRatio: 2,
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 20,
    },
    quick: {
      queuedVoteRequiredPercentage: 60,
      queuedVotePeriodLimit: moment.duration(30, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      thresholdConst: 1050,
      quietEndingPeriod: moment.duration(2, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.002"),
      votersReputationLossRatio: 4,
      minimumDaoBounty: web3.utils.toWei("0.25"),
      daoBountyConst: 10,
    }
  } : {
    master: {
      queuedVoteRequiredPercentage: 50,
      queuedVotePeriodLimit: moment.duration(20, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      thresholdConst: 1500,
      quietEndingPeriod: moment.duration(2, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.02"),
      votersReputationLossRatio: 2,
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 20,
    },
    quick: {
      queuedVoteRequiredPercentage: 60,
      queuedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(2, 'minutes').asSeconds(),
      thresholdConst: 1050,
      quietEndingPeriod: moment.duration(1, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.002"),
      votersReputationLossRatio: 4,
      minimumDaoBounty: web3.utils.toWei("0.25"),
      daoBountyConst: 10,
    }
  };
  console.log('Schemes configuration:', schemesConfiguration);
  
  const masterWalletParameters = {
    queuedVoteRequiredPercentage: schemesConfiguration.master.queuedVoteRequiredPercentage,
    queuedVotePeriodLimit: schemesConfiguration.master.queuedVotePeriodLimit,
    boostedVotePeriodLimit: schemesConfiguration.master.boostedVotePeriodLimit,
    preBoostedVotePeriodLimit: schemesConfiguration.master.preBoostedVotePeriodLimit,
    thresholdConst: schemesConfiguration.master.thresholdConst,
    quietEndingPeriod: schemesConfiguration.master.quietEndingPeriod,
    proposingRepReward: schemesConfiguration.master.proposingRepReward,
    votersReputationLossRatio: schemesConfiguration.master.votersReputationLossRatio,
    minimumDaoBounty: schemesConfiguration.master.minimumDaoBounty,
    daoBountyConst: schemesConfiguration.master.daoBountyConst,
    activationTime: 0,
    voteOnBehalf: NULL_ADDRESS
  }
  
  await dxdVotingMachine.setParameters([
    masterWalletParameters.queuedVoteRequiredPercentage,
    masterWalletParameters.queuedVotePeriodLimit,
    masterWalletParameters.boostedVotePeriodLimit,
    masterWalletParameters.preBoostedVotePeriodLimit,
    masterWalletParameters.thresholdConst,
    masterWalletParameters.quietEndingPeriod,
    masterWalletParameters.proposingRepReward,
    masterWalletParameters.votersReputationLossRatio,
    masterWalletParameters.minimumDaoBounty,
    masterWalletParameters.daoBountyConst,
    masterWalletParameters.activationTime 
  ], masterWalletParameters.voteOnBehalf);
  const masterWalletSchemeParamsHash = await dxdVotingMachine.getParametersHash([
    masterWalletParameters.queuedVoteRequiredPercentage,
    masterWalletParameters.queuedVotePeriodLimit,
    masterWalletParameters.boostedVotePeriodLimit,
    masterWalletParameters.preBoostedVotePeriodLimit,
    masterWalletParameters.thresholdConst,
    masterWalletParameters.quietEndingPeriod,
    masterWalletParameters.proposingRepReward,
    masterWalletParameters.votersReputationLossRatio,
    masterWalletParameters.minimumDaoBounty,
    masterWalletParameters.daoBountyConst,
    masterWalletParameters.activationTime 
  ], masterWalletParameters.voteOnBehalf);
  const masterWalletScheme = await WalletScheme.new();
  await masterWalletScheme.initialize(
    avatar.address,
    dxdVotingMachine.address,
    masterWalletSchemeParamsHash,
    controller.address,
    permissionRegistry.address,
    "Master Wallet",
    86400
  );
  await controller.registerScheme(
    masterWalletScheme.address,
    masterWalletSchemeParamsHash,
    encodePermission({
      canGenericCall: true,
      canUpgrade: true,
      canChangeConstraints: true,
      canRegisterSchemes: true
    }),
    avatar.address
  );
  
  const quickWalletSchemeParameters = {
    queuedVoteRequiredPercentage: schemesConfiguration.quick.queuedVoteRequiredPercentage,
    queuedVotePeriodLimit: schemesConfiguration.quick.queuedVotePeriodLimit,
    boostedVotePeriodLimit: schemesConfiguration.quick.boostedVotePeriodLimit,
    preBoostedVotePeriodLimit: schemesConfiguration.quick.preBoostedVotePeriodLimit,
    thresholdConst: schemesConfiguration.quick.thresholdConst,
    quietEndingPeriod: schemesConfiguration.quick.quietEndingPeriod,
    proposingRepReward: schemesConfiguration.quick.proposingRepReward,
    votersReputationLossRatio: schemesConfiguration.quick.votersReputationLossRatio,
    minimumDaoBounty: schemesConfiguration.quick.minimumDaoBounty,
    daoBountyConst: schemesConfiguration.quick.daoBountyConst,
    activationTime: 0,
    voteOnBehalf: NULL_ADDRESS
  }
  await dxdVotingMachine.setParameters(
    [
      quickWalletSchemeParameters.queuedVoteRequiredPercentage,
      quickWalletSchemeParameters.queuedVotePeriodLimit,
      quickWalletSchemeParameters.boostedVotePeriodLimit,
      quickWalletSchemeParameters.preBoostedVotePeriodLimit,
      quickWalletSchemeParameters.thresholdConst,
      quickWalletSchemeParameters.quietEndingPeriod,
      quickWalletSchemeParameters.proposingRepReward,
      quickWalletSchemeParameters.votersReputationLossRatio,
      quickWalletSchemeParameters.minimumDaoBounty,
      quickWalletSchemeParameters.daoBountyConst,
      quickWalletSchemeParameters.activationTime 
    ],
    quickWalletSchemeParameters.voteOnBehalf
  );
  const quickWalletSchemeParamsHash = await dxdVotingMachine.getParametersHash(
    [
      quickWalletSchemeParameters.queuedVoteRequiredPercentage,
      quickWalletSchemeParameters.queuedVotePeriodLimit,
      quickWalletSchemeParameters.boostedVotePeriodLimit,
      quickWalletSchemeParameters.preBoostedVotePeriodLimit,
      quickWalletSchemeParameters.thresholdConst,
      quickWalletSchemeParameters.quietEndingPeriod,
      quickWalletSchemeParameters.proposingRepReward,
      quickWalletSchemeParameters.votersReputationLossRatio,
      quickWalletSchemeParameters.minimumDaoBounty,
      quickWalletSchemeParameters.daoBountyConst,
      quickWalletSchemeParameters.activationTime 
    ],
    quickWalletSchemeParameters.voteOnBehalf
  );
  const quickWalletScheme = await WalletScheme.new();
  await quickWalletScheme.initialize(
    avatar.address,
    dxdVotingMachine.address,
    quickWalletSchemeParamsHash,
    NULL_ADDRESS,
    permissionRegistry.address,
    "Quick Wallet",
    86400
  );
  
  await controller.registerScheme(
    quickWalletScheme.address,
    quickWalletSchemeParamsHash,
    encodePermission({
      canGenericCall: false,
      canUpgrade: false,
      canChangeConstraints: false,
      canRegisterSchemes: false
    }),
    avatar.address
  );
  await controller.metaData("metaData", avatar.address);
  await controller.unregisterScheme(accounts[0], avatar.address);
  
  // Set permissions to avatar and quickwallet scheme to do anything
  await permissionRegistry.setAdminPermission(
    NULL_ADDRESS, 
    avatar.address, 
    ANY_ADDRESS, 
    ANY_FUNC_SIGNATURE,
    MAX_UINT_256,
    true
  );
  await permissionRegistry.setAdminPermission(
    NULL_ADDRESS, 
    quickWalletScheme.address, 
    ANY_ADDRESS, 
    ANY_FUNC_SIGNATURE,
    MAX_UINT_256,
    true
  );
  
  // Increase one hour that is the time delay for a permission to became enabled
  await web3.currentProvider.send({
    jsonrpc: '2.0',
    method: 'evm_increaseTime',
    params: [moment.duration(1, 'hours').asSeconds()],
    id: 0,
  }, () => {});

  // Transfer permission registry control to avatar
  await permissionRegistry.transferOwnership(avatar.address);
  
  console.log('Running deployment with test data..');
  
  await web3.eth.sendTransaction({to: avatar.address, value: web3.utils.toWei("150"), from: accounts[0]});
  await votingMachineToken.transfer(avatar.address, web3.utils.toWei("100"), {from: accounts[0]});
  await votingMachineToken.transfer(accounts[1], web3.utils.toWei("50"), {from: accounts[0]});
  await votingMachineToken.transfer(accounts[2], web3.utils.toWei("30"), {from: accounts[0]});
  
  const ipfs = await IPFS.create();
  let titleText = "Mint seed REP test proposal";
  let descriptionText = "Set 10 REP tokens to "+accounts[0]+", 20 REP tokens to "+accounts[1]+", and 70 REP tokens to "+accounts[2]
  let cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

  const mintReputationABI = {
      name: 'mintReputation',
      type: 'function',
      inputs: [
        { type: 'uint256', name: '_amount' },
        { type: 'address', name: '_to' },
        { type: 'address', name: '_avatar' }
      ]
  };
  const burnReputationABI = {
      name: 'burnReputation',
      type: 'function',
      inputs: [
        { type: 'uint256', name: '_amount' },
        { type: 'address', name: '_to' },
        { type: 'address', name: '_avatar' }
      ]
  };
  const generiCallABI = {
    name: 'genericCall',
    type: 'function',
    inputs: [
      { name: '_contract', type: 'address' },
      { name: '_data', type: 'bytes' },
      { name: '_avatar', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
  };
  const ERC20TransferABI = {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
  }
  const seedProposalTx = await masterWalletScheme.proposeCalls(
    [controller.address, controller.address, controller.address, controller.address],
    [
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("10"), accounts[0], avatar.address]),
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("20"), accounts[1], avatar.address]),
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("70"), accounts[2], avatar.address]),
      web3.eth.abi.encodeFunctionCall(burnReputationABI, ["100", accounts[0], avatar.address]),
    ],
    [0, 0, 0, 0],
    titleText,
    contentHash.fromIpfs(cid)
  , { from: accounts[0] });
  const seedProposalId = seedProposalTx.logs[0].args[0];
  await dxdVotingMachine.vote(seedProposalId, 1, 0, NULL_ADDRESS, { from: accounts[0] });
  titleText = "First test proposal";
  descriptionText = "Tranfer 15 ETH and 50 tokens to QuickWalletScheme and mint 20 REP";
  cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;
  
  const fisrtProposalTx = await masterWalletScheme.proposeCalls(
    [controller.address, controller.address, controller.address],
    [
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("20"), accounts[1], avatar.address]),
      web3.eth.abi.encodeFunctionCall(generiCallABI, [quickWalletScheme.address, "0x0", avatar.address, web3.utils.toWei("15")]),
      web3.eth.abi.encodeFunctionCall(generiCallABI, [
        votingMachineToken.address,
        web3.eth.abi.encodeFunctionCall(ERC20TransferABI, [quickWalletScheme.address, web3.utils.toWei("50")]),
        avatar.address,
        0
      ]),
    ],
    [0, 0, 0],
    titleText,
    contentHash.fromIpfs(cid)
  , { from: accounts[0] });
  const firstProposalId = fisrtProposalTx.logs[0].args[0];
  titleText = "Second test proposal";
  descriptionText = "Tranfer 10 ETH to " + accounts[1];
  cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

  const secondProposalTx = await masterWalletScheme.proposeCalls(
    [controller.address],
    [
      web3.eth.abi.encodeFunctionCall(generiCallABI, [accounts[1], "0x0", avatar.address, web3.utils.toWei("5")])
    ],
    [0],
    titleText,
    contentHash.fromIpfs(cid)
  , { from: accounts[0] });
  const secondProposalId = secondProposalTx.logs[0].args[0];
  
  titleText = "Third test proposal";
  descriptionText = "Tranfer 3 ETH to " + accounts[2];
  cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

  await quickWalletScheme.proposeCalls(
    [accounts[2]],
    ["0x0"],
    [web3.utils.toWei("5").toString()],
    titleText,
    contentHash.fromIpfs(cid)
  , { from: accounts[0] });
  await dxdVotingMachine.vote(firstProposalId, 1, 0, NULL_ADDRESS, { from: accounts[2] });
  await votingMachineToken.approve( 
    dxdVotingMachine.address, await votingMachineToken.balanceOf(accounts[1]) , {from: accounts[1]}
  );
  await dxdVotingMachine.stake(secondProposalId, 1, web3.utils.toWei("2").toString() , { from: accounts[1] });
  await dxdVotingMachine.vote(secondProposalId, 1, web3.utils.toWei("5"), NULL_ADDRESS, { 
    from: accounts[1]
  });
    
  const contractsDeployed = {
    avatar: avatar.address,
    controller: controller.address,
    reputation: reputation.address,
    votingMachine: dxdVotingMachine.address,
    votingMachineToken: votingMachineToken.address,
    permissionRegistry: permissionRegistry.address,
    multicall: multicall.address,
    fromBlock: 1
  };
  console.log("Contracts Deployed:", contractsDeployed);

  fs.writeFileSync(
    '.developmentAddresses.json',
    JSON.stringify(contractsDeployed, null, 2),
    { encoding:'utf8', flag:'w' }
  )
} 

Promise.all([main()]).then(process.exit);
