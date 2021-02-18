const fs = require('fs');
const Web3 = require('web3');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');
const HDWalletProvider = require('truffle-hdwallet-provider');
const moment = require('moment');
const { encodePermission } = require('./permissions');
const args = process.argv;
require('dotenv').config();
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const IPFS = require('ipfs-core');
const contentHash = require('content-hash');
const request = require("request-promise-native");
const repHolders = require('../.repHolders.json');

// Get network to use from arguments
let network, mnemonic, httpProviderUrl, web3;
for (var i = 0; i < args.length; i++) {
  if (args[i] == '--network')
    network = args[i+1];
}
if (!network) throw('Not network selected, --network parameter missing');

mnemonic = process.env.REACT_APP_KEY_MNEMONIC;
httpProviderUrl = 'http://localhost:8545';

// Get development keys
if (network != 'development') {
  infuraApiKey = process.env.REACT_APP_KEY_INFURA_API_KEY;
  httpProviderUrl = `https://${network}.infura.io/v3/${infuraApiKey }`
} 

console.log('Running deploy on', httpProviderUrl)
const provider = new HDWalletProvider(mnemonic, new Web3.providers.HttpProvider(httpProviderUrl), 0, 10);
web3 = new Web3(provider)
const delay = time => new Promise(res=>setTimeout(res,time));

ZWeb3.initialize(web3.currentProvider);
Contracts.setLocalBuildDir('contracts/build/');

const WalletScheme = Contracts.getFromLocal("WalletScheme");
const DxController = Contracts.getFromLocal("DxController");
const DxAvatar = Contracts.getFromLocal("DxAvatar");
const DxReputation = Contracts.getFromLocal("DxReputation");
const DxToken = Contracts.getFromLocal("DxToken");
const DXDVotingMachine = Contracts.getFromLocal("DXDVotingMachine");
const ERC20Mock = Contracts.getFromLocal("ERC20Mock");
const Multicall = Contracts.getFromLocal("Multicall");

async function main() {
    
  const accounts = await web3.eth.getAccounts();
  const GAS_LIMIT = 9000000;
  const votingMachineToken = (network == 'rinkeby') ? ERC20Mock.at("0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29")
    : await ERC20Mock.new(accounts[0], web3.utils.toWei("1000"));
    
  const reputation = await DxReputation.new();
  if (network != 'development') {
    // Get initial REP holders
    let founders = [], initialRep = [], initialTokens = [];
    for (var address in repHolders.addresses) {
      founders.push(address);
      initialRep.push(repHolders.addresses[address]);
      initialTokens.push(0);
    }
    
    // Deploy and mint reputation
    console.log('Deploying DxReputation...');
    const addressesMints = [], amountMints = [];  
    while (founders.length > 0){
      addressesMints.push(founders.splice(0, 100));
      amountMints.push(initialRep.splice(0, 100));
    }
    for (var i = 0; i < addressesMints.length; i++){
      console.log('Doing mint '+i+' of '+(addressesMints.length-1)+' of initial REP minting...')
      await reputation.methods.mintMultiple(addressesMints[i], amountMints[i]).send();
      await delay(30000);
    }
  } else {
    await reputation.methods.mint(accounts[0], 100).send();
  }
  
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
  await reputation.methods.transferOwnership(controller.address).send();
  await avatar.methods.transferOwnership(controller.address).send();
  await token.methods.transferOwnership(controller.address).send();

  const dxdVotingMachine = await DXDVotingMachine.new(votingMachineToken.address, {gas: GAS_LIMIT});
  const multicall = await Multicall.new();
  
  const schemesConfiguration = (network == 'rinkeby') ? {
    master: {
      queuedVoteRequiredPercentage: 50,
      queuedVotePeriodLimit: moment.duration(6, 'days').asSeconds(),
      boostedVotePeriodLimit: moment.duration(2, 'days').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(0.5, 'days').asSeconds(),
      thresholdConst: 1500,
      quietEndingPeriod: moment.duration(3, 'hours').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.02"),
      votersReputationLossRatio: 2,
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 20,
    },
    quick: {
      queuedVoteRequiredPercentage: 60,
      queuedVotePeriodLimit: moment.duration(3, 'days').asSeconds(),
      boostedVotePeriodLimit: moment.duration(1, 'days').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(0.5, 'days').asSeconds(),
      thresholdConst: 1050,
      quietEndingPeriod: moment.duration(1, 'hours').asSeconds(),
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
      quietEndingPeriod: moment.duration(2.5, 'minutes').asSeconds(),
      proposingRepReward: web3.utils.toWei("0.02"),
      votersReputationLossRatio: 2,
      minimumDaoBounty: web3.utils.toWei("1"),
      daoBountyConst: 20,
    },
    quick: {
      queuedVoteRequiredPercentage: 60,
      queuedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(2.5, 'minutes').asSeconds(),
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
    voteOnBehalf: ZERO_ADDRESS
  }
  
  await dxdVotingMachine.methods.setParameters([
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
  ], masterWalletParameters.voteOnBehalf).send();
  const masterWalletSchemeParamsHash = await dxdVotingMachine.methods.getParametersHash([
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
  ], masterWalletParameters.voteOnBehalf).call();
  const masterWalletScheme = await WalletScheme.new();
  await masterWalletScheme.methods.initialize(
    avatar.address,
    dxdVotingMachine.address,
    masterWalletSchemeParamsHash,
    controller.address
  ).send();
  await controller.methods.registerScheme(
    masterWalletScheme.address,
    masterWalletSchemeParamsHash,
    encodePermission({
      canGenericCall: true,
      canUpgrade: true,
      canChangeConstraints: true,
      canRegisterSchemes: true
    }),
    avatar.address
  ).send();
  
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
    voteOnBehalf: ZERO_ADDRESS
  }
  await dxdVotingMachine.methods.setParameters(
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
  ).send();
  const quickWalletSchemeParamsHash = await dxdVotingMachine.methods.getParametersHash(
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
  ).call();
  const quickWalletScheme = await WalletScheme.new();
  await quickWalletScheme.methods.initialize(
    avatar.address,
    dxdVotingMachine.address,
    quickWalletSchemeParamsHash,
    ZERO_ADDRESS
  ).send();
  
  await controller.methods.registerScheme(
    quickWalletScheme.address,
    quickWalletSchemeParamsHash,
    encodePermission({
      canGenericCall: false,
      canUpgrade: false,
      canChangeConstraints: false,
      canRegisterSchemes: false
    }),
    avatar.address
  ).send();
  await controller.methods.metaData("metaData", avatar.address).send();
  await controller.methods.unregisterScheme(accounts[0], avatar.address).send();
  
  if (network == 'development') {
    console.log('Running deployment with test data..');
    
    await web3.eth.sendTransaction({to: avatar.address, value: web3.utils.toWei("150"), from: accounts[0]});
    await votingMachineToken.methods.transfer(avatar.address, web3.utils.toWei("100")).send({from: accounts[0]});
    await votingMachineToken.methods.transfer(accounts[1], web3.utils.toWei("50")).send({from: accounts[0]});
    await votingMachineToken.methods.transfer(accounts[2], web3.utils.toWei("30")).send({from: accounts[0]});
    
    const ipfs = await IPFS.create();
    let titleText = "Mint seed REP test proposal";
    let descriptionText = "Set 10 REP tokens to "+accounts[0]+", 20 REP tokens to "+accounts[1]+", and 70 REP tokens to "+accounts[2]
    let cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

    const seedProposalTx = await masterWalletScheme.methods.proposeCalls(
      [controller.address, controller.address, controller.address, controller.address],
      [
        controller.methods.mintReputation(
          web3.utils.toWei("10"), accounts[0], avatar.address
        ).encodeABI(),
        controller.methods.mintReputation(
          web3.utils.toWei("20"), accounts[1], avatar.address
        ).encodeABI(),
        controller.methods.mintReputation(
          web3.utils.toWei("70"), accounts[2], avatar.address
        ).encodeABI(),
        controller.methods.burnReputation(
          "100", accounts[0], avatar.address
        ).encodeABI(),
      ],
      [0, 0, 0, 0],
      titleText,
      contentHash.fromIpfs(cid)
    ).send({ from: accounts[0] });
    const seedProposalId = seedProposalTx.events.NewCallProposal.returnValues[0];
    await dxdVotingMachine.methods.vote(seedProposalId, 1, 0, ZERO_ADDRESS).send({ from: accounts[0] });
    titleText = "First test proposal";
    descriptionText = "Tranfer 15 ETH and 50 tokens to QuickWalletScheme and mint 20 REP";
    cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;
    
    const fisrtProposalTx = await masterWalletScheme.methods.proposeCalls(
      [controller.address, controller.address, controller.address],
      [
        controller.methods.mintReputation(
          web3.utils.toWei("20"), accounts[1], avatar.address
        ).encodeABI(),
        controller.methods.genericCall(
          quickWalletScheme.address, "0x0", avatar.address, web3.utils.toWei("15")
        ).encodeABI(),
        controller.methods.genericCall(
          votingMachineToken.address,
          votingMachineToken.methods.transfer(
            quickWalletScheme.address, web3.utils.toWei("50")
          ).encodeABI(),
          avatar.address,
          0
        ).encodeABI(),
      ],
      [0, 0, 0],
      titleText,
      contentHash.fromIpfs(cid)
    ).send({ from: accounts[0] });
    const firstProposalId = fisrtProposalTx.events.NewCallProposal.returnValues[0];
    titleText = "Second test proposal";
    descriptionText = "Tranfer 10 ETH to " + accounts[1];
    cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

    const secondProposalTx = await masterWalletScheme.methods.proposeCalls(
      [controller.address],
      [
        controller.methods.genericCall(
          accounts[1], "0x0", avatar.address, web3.utils.toWei("5")
        ).encodeABI(),
      ],
      [0],
      titleText,
      contentHash.fromIpfs(cid)
    ).send({ from: accounts[0] });
    const secondProposalId = secondProposalTx.events.NewCallProposal.returnValues[0];
    
    titleText = "Third test proposal";
    descriptionText = "Tranfer 3 ETH to " + accounts[2];
    cid = (await ipfs.add({content: `# ${titleText} \n ${descriptionText}`})).cid;

    await quickWalletScheme.methods.proposeCalls(
      [accounts[2]],
      ["0x0"],
      [web3.utils.toWei("5").toString()],
      titleText,
      contentHash.fromIpfs(cid)
    ).send({ from: accounts[0] });
    
    await dxdVotingMachine.methods.vote(firstProposalId, 1, 0, ZERO_ADDRESS).send({ from: accounts[2] });

    await votingMachineToken.methods.approve(
      dxdVotingMachine.address, await votingMachineToken.methods.balanceOf(accounts[1]).call()
    ).send({from: accounts[1]});
    await dxdVotingMachine.methods.stake(secondProposalId, 1, web3.utils.toWei("2").toString())
      .send({ from: accounts[1] });
    await dxdVotingMachine.methods.vote(secondProposalId, 1, web3.utils.toWei("5"), ZERO_ADDRESS).send({ 
      from: accounts[1]
    });
  
  }
  
  const contractsDeployed = {
    avatar: avatar.address,
    controller: controller.address,
    reputation: reputation.address,
    votingMachine: dxdVotingMachine.address,
    votingMachineToken: votingMachineToken.address,
    masterWalletScheme: masterWalletScheme.address,
    quickWalletScheme: quickWalletScheme.address,
    multicall: multicall.address
  };
  console.log("Contracts Deployed:", contractsDeployed);

  if (network == 'development') {
    fs.writeFileSync(
      '.developmentAddresses.json',
      JSON.stringify(contractsDeployed, null, 2),
      { encoding:'utf8', flag:'w' }
    )
  } else {
    fs.writeFileSync(
      'src/config/'+network+'.json',
      JSON.stringify(contractsDeployed, null, 2),
      { encoding:'utf8', flag:'w' }
    )
  }
  
} 

Promise.all([main()]).then(process.exit);
