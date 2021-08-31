const hre = require("hardhat");
const fs = require("fs");
const web3 = hre.web3;
const moment = require("moment");
const { encodePermission, decodePermission } = require('../src/utils/permissions');
const IPFS = require('ipfs-core');
const contentHash = require('content-hash');

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
  
  // Deploy Avatar
  console.log('Deploying DxAvatar...');
  const avatar = await DxAvatar.new("DXdao", votingMachineToken.address, reputation.address, {gas: GAS_LIMIT});

  // Deploy controller and transfer avatar to controller
  console.log('Deploying DxController...');
  const controller = await DxController.new(avatar.address, {gas: GAS_LIMIT});
  
  // Transfer reputation adn avatar to controller
  await reputation.transferOwnership(controller.address);
  await avatar.transferOwnership(controller.address);

  const dxdVotingMachine = await DXDVotingMachine.new(votingMachineToken.address, {gas: GAS_LIMIT});
  const multicall = await Multicall.new();
  
  const permissionRegistry = await PermissionRegistry.new(
    accounts[0], 1, { gas: 1000000 }
  );
  
  // Only allow the functions mintReputation, burnReputation, genericCall, registerScheme and unregisterScheme to be
  // called to in the controller contract from a scheme that calls the controller.
  // This permissions makes the other functions inaccessible
  const notAllowedControllerFunctions = [
    controller.contract._jsonInterface.find(method => method.name == 'mintTokens').signature,
    controller.contract._jsonInterface.find(method => method.name == 'unregisterSelf').signature,
    controller.contract._jsonInterface.find(method => method.name == 'addGlobalConstraint').signature,
    controller.contract._jsonInterface.find(method => method.name == 'removeGlobalConstraint').signature,
    controller.contract._jsonInterface.find(method => method.name == 'upgradeController').signature,
    controller.contract._jsonInterface.find(method => method.name == 'sendEther').signature,
    controller.contract._jsonInterface.find(method => method.name == 'externalTokenTransfer').signature,
    controller.contract._jsonInterface.find(method => method.name == 'externalTokenTransferFrom').signature,
    controller.contract._jsonInterface.find(method => method.name == 'externalTokenApproval').signature,
    controller.contract._jsonInterface.find(method => method.name == 'metaData').signature
  ];
  for (var i = 0; i < notAllowedControllerFunctions.length; i++) {
    await permissionRegistry.setAdminPermission(
      NULL_ADDRESS, 
      avatar.address, 
      controller.address, 
      notAllowedControllerFunctions[i],
      MAX_UINT_256, 
      false
    );
  }
  
  await permissionRegistry.setAdminPermission(
    NULL_ADDRESS,
    avatar.address,
    controller.address,
    ANY_FUNC_SIGNATURE,
    0,
    true
  );
  
  const schemesConfiguration = [
    {
      name: "RegistrarWalletScheme",
      callToController: true,
      maxSecondsForExecution: moment.duration(21, 'minutes').asSeconds(),
      maxRepPercentageToMint: 0,
      controllerPermissions: {
        canGenericCall: false,
        canUpgrade: false,
        canChangeConstraints: false,
        canRegisterSchemes: true
      },
      permissions: [],
      queuedVoteRequiredPercentage: 75,
      boostedVoteRequiredPercentage: 2500,
      queuedVotePeriodLimit: moment.duration(15, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(3, 'minutes').asSeconds(),
      thresholdConst: 2000,
      quietEndingPeriod: moment.duration(2, 'minutes').asSeconds(),
      proposingRepReward: 0,
      votersReputationLossRatio: 100,
      minimumDaoBounty: web3.utils.toWei("100"),
      daoBountyConst: 2,
    },{
      name: "MasterWalletScheme",
      callToController: true,
      maxSecondsForExecution: moment.duration(20, 'minutes').asSeconds(),
      maxRepPercentageToMint: 5,
      controllerPermissions: {
        canGenericCall: true,
        canUpgrade: false,
        canChangeConstraints: false,
        canRegisterSchemes: false
      },
      permissions: [{
        asset: NULL_ADDRESS,
        to: "SCHEME",
        functionSignature: ANY_FUNC_SIGNATURE,
        value: web3.utils.toWei("100"),
        allowed: true
      }],
      queuedVoteRequiredPercentage: 50,
      boostedVoteRequiredPercentage: 5,
      queuedVotePeriodLimit: moment.duration(15, 'minutes').asSeconds(), 
      boostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(), 
      preBoostedVotePeriodLimit: moment.duration(2, 'minutes').asSeconds(), 
      thresholdConst: 1500, 
      quietEndingPeriod: moment.duration(2, 'minutes').asSeconds(), 
      proposingRepReward: 0, 
      votersReputationLossRatio: 10, 
      minimumDaoBounty: web3.utils.toWei("10"),
      daoBountyConst: 2
    },{
      name: "QuickWalletScheme",
      callToController: false,
      maxSecondsForExecution: moment.duration(10, 'minutes').asSeconds(),
      maxRepPercentageToMint: 1,
      controllerPermissions: {
        canGenericCall: false,
        canUpgrade: false,
        canChangeConstraints: false,
        canRegisterSchemes: false
      },
      permissions: [{
        asset: NULL_ADDRESS,
        to: ANY_ADDRESS,
        functionSignature: ANY_FUNC_SIGNATURE,
        value: MAX_UINT_256,
        allowed: true
      }],
      queuedVoteRequiredPercentage: 50,
      boostedVoteRequiredPercentage: 1,
      queuedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(), 
      boostedVotePeriodLimit: moment.duration(2, 'minutes').asSeconds(), 
      preBoostedVotePeriodLimit: moment.duration(1, 'minutes').asSeconds(), 
      thresholdConst: 1500, 
      quietEndingPeriod: moment.duration(1, 'minutes').asSeconds(), 
      proposingRepReward: 0, 
      votersReputationLossRatio: 1, 
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 2
    }
  ];
  console.log('Schemes configuration:', schemesConfiguration);
  
  let schemes = {};
  for (var i = 0; i < schemesConfiguration.length; i++) {
    const schemeConfiguration = schemesConfiguration[i];
      
    console.log(`Deploying ${schemeConfiguration.name}...`);
    const newScheme = await WalletScheme.new();
    console.log(`${schemeConfiguration.name} deployed to: ${newScheme.address}`);
    
    const timeNow = moment().unix();
    let schemeParamsHash = await dxdVotingMachine.getParametersHash(
      [
        schemeConfiguration.queuedVoteRequiredPercentage,
        schemeConfiguration.queuedVotePeriodLimit,
        schemeConfiguration.boostedVotePeriodLimit,
        schemeConfiguration.preBoostedVotePeriodLimit,
        schemeConfiguration.thresholdConst,
        schemeConfiguration.quietEndingPeriod,
        schemeConfiguration.proposingRepReward,
        schemeConfiguration.votersReputationLossRatio,
        schemeConfiguration.minimumDaoBounty,
        schemeConfiguration.daoBountyConst,
        timeNow,
      ], NULL_ADDRESS
    );

    await dxdVotingMachine.setParameters(
      [
        schemeConfiguration.queuedVoteRequiredPercentage,
        schemeConfiguration.queuedVotePeriodLimit,
        schemeConfiguration.boostedVotePeriodLimit,
        schemeConfiguration.preBoostedVotePeriodLimit,
        schemeConfiguration.thresholdConst,
        schemeConfiguration.quietEndingPeriod,
        schemeConfiguration.proposingRepReward,
        schemeConfiguration.votersReputationLossRatio,
        schemeConfiguration.minimumDaoBounty,
        schemeConfiguration.daoBountyConst,
        timeNow,
      ], NULL_ADDRESS
    );
    
    console.log("Initializing scheme...");
    await newScheme.initialize(
      avatar.address,
      dxdVotingMachine.address,
      schemeParamsHash,
      schemeConfiguration.callToController ? controller.address : NULL_ADDRESS,
      permissionRegistry.address,
      schemeConfiguration.name,
      Math.max(86400, schemeConfiguration.maxSecondsForExecution),
      schemeConfiguration.maxRepPercentageToMint
    );
    
    console.log("Setting scheme permissions...");
    await Promise.all(schemeConfiguration.permissions.map(async (permission) => {
      await permissionRegistry.setAdminPermission(
        permission.asset, 
        schemeConfiguration.callToController ? controller.address : newScheme.address,
        permission.to == "SCHEME" ? newScheme.address : permission.to,
        permission.functionSignature,
        permission.value,
        permission.allowed
      );
    }))
    
    console.log('Registering scheme in controller...');
    await controller.registerScheme(
      newScheme.address,
      schemeParamsHash,
      encodePermission(schemeConfiguration.controllerPermissions),
      avatar.address
    );
    
    if (schemeConfiguration.boostedVoteRequiredPercentage > 0){
      console.log('Setting boosted vote required percentage in voting machine...');
      await dxdVotingMachine.setBoostedVoteRequiredPercentage(
        newScheme.address, schemeParamsHash, schemeConfiguration.boostedVoteRequiredPercentage
      );
    }
    
    schemes[schemeConfiguration.name] = newScheme;
    
  }
  
  await permissionRegistry.setTimeDelay(moment.duration(10, 'minutes').asSeconds());
  
  await controller.mintReputation(web3.utils.toWei("10"), accounts[0], avatar.address);
  await controller.mintReputation(web3.utils.toWei("20"), accounts[1], avatar.address);
  await controller.mintReputation(web3.utils.toWei("70"), accounts[2], avatar.address);
  await controller.burnReputation(100, accounts[0], avatar.address);
  
  await controller.unregisterScheme(accounts[0], avatar.address);
  
  // Transfer permission registry control to avatar
  await permissionRegistry.transferOwnership(avatar.address);
  
  console.log('Running deployment with test data..');
  
  await web3.eth.sendTransaction({to: avatar.address, value: web3.utils.toWei("150"), from: accounts[0]});
  await votingMachineToken.transfer(avatar.address, web3.utils.toWei("100"), {from: accounts[0]});
  await votingMachineToken.transfer(accounts[1], web3.utils.toWei("50"), {from: accounts[0]});
  await votingMachineToken.transfer(accounts[2], web3.utils.toWei("30"), {from: accounts[0]});
  
  const ipfs = await IPFS.create();
  
  async function uploadAndGetContentHash(descriptionText) {
    const cid = (await ipfs.add({content: descriptionText})).cid;
    await ipfs.pin.add(cid);
    return contentHash.fromIpfs(cid);
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
  // const burnReputationABI = {
  //     name: 'burnReputation',
  //     type: 'function',
  //     inputs: [
  //       { type: 'uint256', name: '_amount' },
  //       { type: 'address', name: '_to' },
  //       { type: 'address', name: '_avatar' }
  //     ]
  // };
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
  };
  
  const setBoostedVoteRequiredPercentageABI ={
    name: 'setBoostedVoteRequiredPercentage',
    type: 'function',
    inputs: [
      { name: '_scheme', type: 'address' },
      { name: '_paramsHash', type: 'bytes32' },
      { name: '_boostedVotePeriodLimit', type: 'uint256' }
    ],
  }
  
  // // Create test proposal 0 to mint multiple REP
  let descriptionText = "Set 10 REP tokens to "+accounts[0]+", 20 REP tokens to "+accounts[1]+", and 70 REP tokens to "+accounts[2]
  // const testProposal0 = ( await schemes["MasterWalletScheme"].proposeCalls(
  //   [controller.address, controller.address, controller.address, controller.address],
  //   [
  //     web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("10"), accounts[0], avatar.address]),
  //     web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("20"), accounts[1], avatar.address]),
  //     web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("70"), accounts[2], avatar.address]),
  //     web3.eth.abi.encodeFunctionCall(burnReputationABI, ["100", accounts[0], avatar.address]),
  //   ],
  //   [0, 0, 0, 0],
  //   "Test Proposal #0 (Seed rep mint)",
  //   await uploadAndGetContentHash(descriptionText),
  //   { from: accounts[0] }
  // ) ).logs[0].args[0];
  // 
  // // Pass test proposal 0 with majority vote
  // await dxdVotingMachine.vote(testProposal0, 1, 0, NULL_ADDRESS, { from: accounts[0] });
  
  // Create test proposal #1 to set VoostedVoteRequiredPercentage in Master Wallet
  descriptionText = "Set required % of votes for boosted proposals to 1% to execute in Master Wallet.";
  const testProposal1 = ( await schemes["MasterWalletScheme"].proposeCalls(
    [controller.address],
    [
      web3.eth.abi.encodeFunctionCall(generiCallABI, [
        dxdVotingMachine.address,
        web3.eth.abi.encodeFunctionCall(setBoostedVoteRequiredPercentageABI, [
          schemes["MasterWalletScheme"].address,
          await controller.getSchemeParameters(schemes["MasterWalletScheme"].address, avatar.address),
          1000
        ]),
        avatar.address,
        0
      ]),
    ],
    [0],
    "Test Proposal #1",
    await uploadAndGetContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];
  await dxdVotingMachine.vote(testProposal1, 1, 0, NULL_ADDRESS, { from: accounts[2] });
  
  // Create test proposal 2
  descriptionText = "Mint 20 REP, tranfer 15 ETH and 50 tokens to QuickWalletScheme.";
  const testProposal2 = ( await schemes["MasterWalletScheme"].proposeCalls(
    [controller.address, controller.address, controller.address],
    [
      web3.eth.abi.encodeFunctionCall(mintReputationABI, [web3.utils.toWei("1"), accounts[1], avatar.address]),
      web3.eth.abi.encodeFunctionCall(generiCallABI, [schemes["QuickWalletScheme"].address, "0x0", avatar.address, web3.utils.toWei("15")]),
      web3.eth.abi.encodeFunctionCall(generiCallABI, [
        votingMachineToken.address,
        web3.eth.abi.encodeFunctionCall(ERC20TransferABI, [schemes["QuickWalletScheme"].address, web3.utils.toWei("50")]),
        avatar.address,
        0
      ]),
    ],
    [0, 0, 0],
    "Test Proposal #2",
    await uploadAndGetContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];
  
  // Pass proposal2 with majority vote
  await dxdVotingMachine.vote(testProposal2, 1, 0, NULL_ADDRESS, { from: accounts[2] });

  descriptionText = "Tranfer 5 ETH to " + accounts[1];
  const testProposal3 = (await schemes["MasterWalletScheme"].proposeCalls(
    [controller.address],
    [
      web3.eth.abi.encodeFunctionCall(generiCallABI, [accounts[1], "0x0", avatar.address, web3.utils.toWei("5")])
    ],
    [0],
    "Test Proposal #3",
    await uploadAndGetContentHash(descriptionText),
    { from: accounts[0] }
  ) ).logs[0].args[0];
  
  // Stake and vote a bit in test proposal 3
  await votingMachineToken.approve( 
    dxdVotingMachine.address, await votingMachineToken.balanceOf(accounts[1]) , {from: accounts[1]}
  );
  await dxdVotingMachine.stake(testProposal3, 1, web3.utils.toWei("2.22222222").toString() , { from: accounts[1] });
  await dxdVotingMachine.vote(testProposal3, 1, web3.utils.toWei("5.77777777"), NULL_ADDRESS, { 
    from: accounts[1]
  });

  // Create test proposal 3 in quick wallet scheme
  descriptionText = "Tranfer 5 ETH to " + accounts[2];
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[2]],
    ["0x0"],
    [web3.utils.toWei("5").toString()],
    "Test Proposal #4",
    await uploadAndGetContentHash(descriptionText),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #5",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #6",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #7",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #8",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #9",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #10",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #11",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #12",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
  
  await schemes["QuickWalletScheme"].proposeCalls(
    [accounts[1]],
    ["0x0"],
    [web3.utils.toWei("666").toString()],
    "Test Proposal #13",
    await uploadAndGetContentHash('Transfer 666 wei ETH to '+accounts[1]),
    { from: accounts[0] }
  );
    
  const contractsDeployed = {
    fromBlock: 1,
    avatar: avatar.address,
    controller: controller.address,
    reputation: reputation.address,
    votingMachines: {
      dxd: {
        address: dxdVotingMachine.address,
        token: votingMachineToken.address
      }
    },
    permissionRegistry: permissionRegistry.address,
    multicall: multicall.address
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
