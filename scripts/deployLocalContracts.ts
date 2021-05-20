const hre = require("hardhat");
const fs = require("fs");
const web3 = hre.web3;
var moment = require("moment");
const { encodePermission, decodePermission } = require('../src/utils/permissions');
const IPFS = require('ipfs-core');
const contentHash = require('content-hash');
const request = require("request-promise-native");
const repHolders = require('../.repHolders.json');

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const MAX_UINT_256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const ANY_ADDRESS = "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa";
const ANY_FUNC_SIGNATURE = "0xaaaaaaaa";

const delay = time => new Promise(res=>setTimeout(res,time));

const WalletScheme = hre.artifacts.require("WalletScheme");
const PermissionRegistry = hre.artifacts.require("PermissionRegistry");
const DxController = hre.artifacts.require("DxController");
const DxAvatar = hre.artifacts.require("DxAvatar");
const DxReputation = hre.artifacts.require("DxReputation");
const DxToken = hre.artifacts.require("DxToken");
const DXDVotingMachine = hre.artifacts.require("DXDVotingMachine");
const ERC20Mock = hre.artifacts.require("ERC20Mock");
const Multicall = hre.artifacts.require("Multicall");

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
  
  const schemesConfiguration = {
    master: {
      queuedVoteRequiredPercentage: 50,
      queuedVotePeriodLimit: moment.duration(40, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(20, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      thresholdConst: 1500,
      quietEndingPeriod: moment.duration(4, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.02"),
      votersReputationLossRatio: 2,
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 20,
    },
    quick: {
      queuedVoteRequiredPercentage: 60,
      queuedVotePeriodLimit: moment.duration(20, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      thresholdConst: 1050,
      quietEndingPeriod: moment.duration(2, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.002"),
      votersReputationLossRatio: 4,
      minimumDaoBounty: web3.utils.toWei("0.25"),
      daoBountyConst: 10,
    }
  };
  console.log('Schemes configuration:', schemesConfiguration);
  
  await dxdVotingMachine.setParameters([
      schemesConfiguration.master.queuedVoteRequiredPercentage,
      schemesConfiguration.master.queuedVotePeriodLimit,
      schemesConfiguration.master.boostedVotePeriodLimit,
      schemesConfiguration.master.preBoostedVotePeriodLimit,
      schemesConfiguration.master.thresholdConst,
      schemesConfiguration.master.quietEndingPeriod,
      schemesConfiguration.master.proposingRepReward,
      schemesConfiguration.master.votersReputationLossRatio,
      schemesConfiguration.master.minimumDaoBounty,
      schemesConfiguration.master.daoBountyConst,
      0 
    ], NULL_ADDRESS
  );
  const masterWalletSchemeParamsHash = await dxdVotingMachine.getParametersHash([
      schemesConfiguration.master.queuedVoteRequiredPercentage,
      schemesConfiguration.master.queuedVotePeriodLimit,
      schemesConfiguration.master.boostedVotePeriodLimit,
      schemesConfiguration.master.preBoostedVotePeriodLimit,
      schemesConfiguration.master.thresholdConst,
      schemesConfiguration.master.quietEndingPeriod,
      schemesConfiguration.master.proposingRepReward,
      schemesConfiguration.master.votersReputationLossRatio,
      schemesConfiguration.master.minimumDaoBounty,
      schemesConfiguration.master.daoBountyConst,
      0 
    ], NULL_ADDRESS
  );
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
  
  await dxdVotingMachine.setParameters(
    [
      schemesConfiguration.quick.queuedVoteRequiredPercentage,
      schemesConfiguration.quick.queuedVotePeriodLimit,
      schemesConfiguration.quick.boostedVotePeriodLimit,
      schemesConfiguration.quick.preBoostedVotePeriodLimit,
      schemesConfiguration.quick.thresholdConst,
      schemesConfiguration.quick.quietEndingPeriod,
      schemesConfiguration.quick.proposingRepReward,
      schemesConfiguration.quick.votersReputationLossRatio,
      schemesConfiguration.quick.minimumDaoBounty,
      schemesConfiguration.quick.daoBountyConst,
      0 
    ],
    NULL_ADDRESS
  );
  const quickWalletSchemeParamsHash = await dxdVotingMachine.getParametersHash(
    [
      schemesConfiguration.quick.queuedVoteRequiredPercentage,
      schemesConfiguration.quick.queuedVotePeriodLimit,
      schemesConfiguration.quick.boostedVotePeriodLimit,
      schemesConfiguration.quick.preBoostedVotePeriodLimit,
      schemesConfiguration.quick.thresholdConst,
      schemesConfiguration.quick.quietEndingPeriod,
      schemesConfiguration.quick.proposingRepReward,
      schemesConfiguration.quick.votersReputationLossRatio,
      schemesConfiguration.quick.minimumDaoBounty,
      schemesConfiguration.quick.daoBountyConst,
      0
    ],
    NULL_ADDRESS
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
  
  async function getContentHash(descriptionText) {
    return contentHash.fromIpfs(
      (await ipfs.add({content: descriptionText})).cid
    );
  }

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
  
  // Create test proposal 0 to mint multiple REP
  let descriptionText = "Set 10 REP tokens to "+accounts[0]+", 20 REP tokens to "+accounts[1]+", and 70 REP tokens to "+accounts[2]
  const testProposal0 = ( await masterWalletScheme.proposeCalls(
    [controller.address, controller.address, controller.address, controller.address],
    [
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("10"), accounts[0], avatar.address]),
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("20"), accounts[1], avatar.address]),
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("70"), accounts[2], avatar.address]),
      web3.eth.abi.encodeFunctionCall(burnReputationABI, ["100", accounts[0], avatar.address]),
    ],
    [0, 0, 0, 0],
    "Test Proposal #0 (Seed rep mint)",
    await getContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];

  // Pass test proposal 0 with majority vote
  await dxdVotingMachine.vote(testProposal0, 1, 0, NULL_ADDRESS, { from: accounts[0] });
  
  // Create test proposal 1
  descriptionText = "Mint 20 REP, tranfer 15 ETH and 50 tokens to QuickWalletScheme.";
  const testProposal1 = ( await masterWalletScheme.proposeCalls(
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
    "Test Proposal #1",
    await getContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];
  
  // Pass proposal1 with majority vote
  await dxdVotingMachine.vote(testProposal1, 1, 0, NULL_ADDRESS, { from: accounts[2] });

  descriptionText = "Tranfer 5 ETH to " + accounts[1];
  const testProposal2 = (await masterWalletScheme.proposeCalls(
    [controller.address],
    [
      web3.eth.abi.encodeFunctionCall(generiCallABI, [accounts[1], "0x0", avatar.address, web3.utils.toWei("5")])
    ],
    [0],
    "Test Proposal #2",
    await getContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];
  
  // Stake and vote a bit in test proposal 2
  await votingMachineToken.approve( 
    dxdVotingMachine.address, await votingMachineToken.balanceOf(accounts[1]) , {from: accounts[1]}
  );
  await dxdVotingMachine.stake(testProposal2, 1, web3.utils.toWei("2").toString() , { from: accounts[1] });
  await dxdVotingMachine.vote(testProposal2, 1, web3.utils.toWei("5"), NULL_ADDRESS, { 
    from: accounts[1]
  });

  // Create test proposal 3 in quick wallet scheme
  descriptionText = "Tranfer 5 ETH to " + accounts[2];
  await quickWalletScheme.proposeCalls(
    [accounts[2]],
    ["0x0"],
    [web3.utils.toWei("5").toString()],
    "Test Proposal #3",
    await getContentHash(descriptionText),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #4",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #5",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #6",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #7",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #8",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #9",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #10",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #11",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await quickWalletScheme.proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #12",
    await getContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
    
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
