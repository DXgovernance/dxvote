import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import {
  ANY_FUNC_SIGNATURE,
  ZERO_ADDRESS,
  ANY_ADDRESS,
} from '../src/utils/constants';

const hre = require('hardhat');
const moment = require('moment');

async function main() {
  const web3 = hre.web3;
  const PermissionRegistry = await hre.artifacts.require('PermissionRegistry');
  const ERC20Guild = await hre.artifacts.require('ERC20Guild');
  const SnapshotERC20Guild = await hre.artifacts.require('SnapshotERC20Guild');
  const accounts = await web3.eth.getAccounts();

  const deployconfig = {
    reputation: [
      {
        address: accounts[0],
        amount: 6000,
      },
      {
        address: accounts[1],
        amount: 4000,
      },
      {
        address: accounts[2],
        amount: 1000,
      },
    ],

    tokens: [
      {
        name: 'DXDao on localhost',
        symbol: 'DXD',
        type: 'ERC20',
        distribution: [
          {
            address: accounts[0],
            amount: web3.utils.toWei('320'),
          },
          {
            address: accounts[1],
            amount: web3.utils.toWei('50'),
          },
          {
            address: accounts[2],
            amount: web3.utils.toWei('10'),
          },
        ],
      },
      {
        name: 'REPGuildToken',
        symbol: 'RGT',
        type: 'ERC20SnapshotRep',
        distribution: [
          {
            address: accounts[0],
            amount: web3.utils.toWei('200'),
          },
          {
            address: accounts[1],
            amount: web3.utils.toWei('50'),
          },
          {
            address: accounts[2],
            amount: web3.utils.toWei('10'),
          },
        ],
      },
      {
        name: 'Snapshot Guild Token',
        symbol: 'SGT',
        type: 'ERC20',
        distribution: [
          {
            address: accounts[0],
            amount: web3.utils.toWei('200'),
          },
          {
            address: accounts[1],
            amount: web3.utils.toWei('40'),
          },
          {
            address: accounts[2],
            amount: web3.utils.toWei('100'),
          },
        ],
      },
    ],

    permissionRegistryDelay: moment.duration(10, 'minutes').asSeconds(),

    contributionReward: {
      queuedVoteRequiredPercentage: 50,
      queuedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
      boostedVotePeriodLimit: moment.duration(3, 'minutes').asSeconds(),
      preBoostedVotePeriodLimit: moment.duration(1, 'minutes').asSeconds(),
      thresholdConst: 2000,
      quietEndingPeriod: moment.duration(0.5, 'minutes').asSeconds(),
      proposingRepReward: 10,
      votersReputationLossRatio: 100,
      minimumDaoBounty: web3.utils.toWei('1'),
      daoBountyConst: 100,
    },

    walletSchemes: [
      {
        name: 'RegistrarWalletScheme',
        doAvatarGenericCalls: true,
        maxSecondsForExecution: moment.duration(31, 'days').asSeconds(),
        maxRepPercentageChange: 0,
        controllerPermissions: {
          canGenericCall: true,
          canUpgrade: true,
          canRegisterSchemes: true,
        },
        permissions: [],
        queuedVoteRequiredPercentage: 75,
        boostedVoteRequiredPercentage: 5 * 100,
        queuedVotePeriodLimit: moment.duration(15, 'minutes').asSeconds(),
        boostedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
        preBoostedVotePeriodLimit: moment.duration(2, 'minutes').asSeconds(),
        thresholdConst: 2000,
        quietEndingPeriod: moment.duration(1, 'minutes').asSeconds(),
        proposingRepReward: 0,
        votersReputationLossRatio: 100,
        minimumDaoBounty: web3.utils.toWei('10'),
        daoBountyConst: 100,
      },
      {
        name: 'MasterWalletScheme',
        doAvatarGenericCalls: true,
        maxSecondsForExecution: moment.duration(31, 'days').asSeconds(),
        maxRepPercentageChange: 40,
        controllerPermissions: {
          canGenericCall: true,
          canUpgrade: false,
          canChangeConstraints: false,
          canRegisterSchemes: false,
        },
        permissions: [
          {
            asset: '0x0000000000000000000000000000000000000000',
            to: 'DXDVotingMachine',
            functionSignature: '0xaaaaaaaa',
            value:
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            allowed: true,
          },
          {
            asset: '0x0000000000000000000000000000000000000000',
            to: 'RegistrarWalletScheme',
            functionSignature: '0xaaaaaaaa',
            value:
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            allowed: true,
          },
          {
            asset: '0x0000000000000000000000000000000000000000',
            to: 'ITSELF',
            functionSignature: '0xaaaaaaaa',
            value:
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            allowed: true,
          },
        ],
        queuedVoteRequiredPercentage: 50,
        boostedVoteRequiredPercentage: 2 * 100,
        queuedVotePeriodLimit: moment.duration(10, 'minutes').asSeconds(),
        boostedVotePeriodLimit: moment.duration(3, 'minutes').asSeconds(),
        preBoostedVotePeriodLimit: moment.duration(1, 'minutes').asSeconds(),
        thresholdConst: 1500,
        quietEndingPeriod: moment.duration(0.5, 'minutes').asSeconds(),
        proposingRepReward: 0,
        votersReputationLossRatio: 5,
        minimumDaoBounty: web3.utils.toWei('1'),
        daoBountyConst: 10,
      },
      {
        name: 'QuickWalletScheme',
        doAvatarGenericCalls: false,
        maxSecondsForExecution: moment.duration(31, 'days').asSeconds(),
        maxRepPercentageChange: 1,
        controllerPermissions: {
          canGenericCall: false,
          canUpgrade: false,
          canChangeConstraints: false,
          canRegisterSchemes: false,
        },
        permissions: [
          {
            asset: '0x0000000000000000000000000000000000000000',
            to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
            functionSignature: '0xaaaaaaaa',
            value:
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            allowed: true,
          },
          {
            asset: 'DXD',
            to: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
            functionSignature: '0xaaaaaaaa',
            value:
              '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            allowed: true,
          },
        ],
        queuedVoteRequiredPercentage: 50,
        boostedVoteRequiredPercentage: 10 * 100,
        queuedVotePeriodLimit: moment.duration(5, 'minutes').asSeconds(),
        boostedVotePeriodLimit: moment.duration(1, 'minutes').asSeconds(),
        preBoostedVotePeriodLimit: moment.duration(0.5, 'minutes').asSeconds(),
        thresholdConst: 1300,
        quietEndingPeriod: moment.duration(0.5, 'minutes').asSeconds(),
        proposingRepReward: 0,
        votersReputationLossRatio: 10,
        minimumDaoBounty: web3.utils.toWei('0.1'),
        daoBountyConst: 10,
      },
    ],

    guilds: [
      {
        token: 'DXD',
        contractName: 'DXDGuild',
        name: 'DXDGuild',
        proposalTime: moment.duration(10, 'minutes').asSeconds(),
        timeForExecution: moment.duration(5, 'minutes').asSeconds(),
        votingPowerForProposalExecution: '30',
        votingPowerForProposalCreation: '1',
        voteGas: '0',
        maxGasPrice: '0',
        maxActiveProposals: '2',
        lockTime: moment.duration(10, 'minutes').asSeconds(),
      },
      {
        token: 'RGT',
        contractName: 'SnapshotRepERC20Guild',
        name: 'REPGuild',
        proposalTime: moment.duration(5, 'minutes').asSeconds(),
        timeForExecution: moment.duration(2, 'minutes').asSeconds(),
        votingPowerForProposalExecution: '50',
        votingPowerForProposalCreation: '5',
        voteGas: '0',
        maxGasPrice: '0',
        maxActiveProposals: '5',
        lockTime: moment.duration(5, 'minutes').asSeconds(),
      },
      {
        token: 'SGT',
        contractName: 'SnapshotERC20Guild',
        name: 'SnapshotERC20Guild',
        proposalTime: moment.duration(5, 'minutes').asSeconds(),
        timeForExecution: moment.duration(2, 'minutes').asSeconds(),
        votingPowerForProposalExecution: '50',
        votingPowerForProposalCreation: '5',
        voteGas: '0',
        maxGasPrice: '0',
        maxActiveProposals: '5',
        lockTime: moment.duration(5, 'minutes').asSeconds(),
      },
    ],

    startTimestampForActions: moment().subtract(26, 'minutes').unix(),

    actions: [
      {
        type: 'transfer',
        from: accounts[0],
        data: {
          asset: ZERO_ADDRESS,
          address: 'Avatar',
          amount: web3.utils.toWei('50'),
        },
      },
      {
        type: 'transfer',
        from: accounts[0],
        data: {
          asset: 'DXD',
          address: 'Avatar',
          amount: web3.utils.toWei('20'),
        },
      },

      {
        type: 'transfer',
        from: accounts[0],
        data: {
          asset: ZERO_ADDRESS,
          address: 'DXDGuild',
          amount: web3.utils.toWei('10'),
        },
      },
      {
        type: 'transfer',
        from: accounts[0],
        data: {
          asset: 'DXD',
          address: 'DXDGuild',
          amount: web3.utils.toWei('100'),
        },
      },

      {
        type: 'transfer',
        from: accounts[1],
        data: {
          asset: ZERO_ADDRESS,
          address: 'SnapshotERC20Guild',
          amount: web3.utils.toWei('10'),
        },
      },
      {
        type: 'transfer',
        from: accounts[1],
        data: {
          asset: 'SGT',
          address: 'SnapshotERC20Guild',
          amount: web3.utils.toWei('10'),
        },
      },

      {
        type: 'transfer',
        from: accounts[0],
        data: {
          asset: ZERO_ADDRESS,
          address: 'REPGuild',
          amount: web3.utils.toWei('12'),
        },
      },

      {
        type: 'proposal',
        from: accounts[2],
        data: {
          to: ['PermissionRegistry'],
          callData: [
            new web3.eth.Contract(PermissionRegistry.abi).methods
              .setPermission(
                ZERO_ADDRESS,
                '0xE0FC07f3aC4F6AF1463De20eb60Cf1A764E259db',
                '0x1A0370A6f5b6cE96B1386B208a8519552eb714D9',
                ANY_FUNC_SIGNATURE,
                web3.utils.toWei('10'),
                true
              )
              .encodeABI(),
          ],
          value: ['0'],
          title: 'Proposal Test #0',
          description: 'Allow sending up to 10 ETH to QuickWalletScheme',
          tags: ['dxvote'],
          scheme: 'MasterWalletScheme',
        },
      },
      {
        type: 'stake',
        from: accounts[2],
        data: {
          proposal: '0',
          decision: '1',
          amount: web3.utils.toWei('1.01'),
        },
      },
      {
        type: 'vote',
        time: moment.duration(1, 'minutes').asSeconds(),
        from: accounts[2],
        data: {
          proposal: '0',
          decision: '1',
          amount: '0',
        },
      },
      {
        type: 'execute',
        time: moment.duration(3, 'minutes').asSeconds(),
        from: accounts[2],
        data: {
          proposal: '0',
        },
      },
      {
        type: 'redeem',
        from: accounts[2],
        data: {
          proposal: '0',
        },
      },

      {
        type: 'proposal',
        from: accounts[2],
        data: {
          to: ['QuickWalletScheme'],
          callData: ['0x0'],
          value: [web3.utils.toWei('10')],
          title: 'Proposal Test #1',
          description: 'Send 10 ETH to QuickWalletScheme',
          tags: ['dxvote'],
          scheme: 'MasterWalletScheme',
        },
      },
      {
        type: 'stake',
        from: accounts[2],
        data: {
          proposal: '1',
          decision: '1',
          amount: web3.utils.toWei('1.01'),
        },
      },
      {
        type: 'vote',
        time: moment.duration(1, 'minutes').asSeconds(),
        from: accounts[2],
        data: {
          proposal: '1',
          decision: '1',
          amount: '0',
        },
      },
      {
        type: 'vote',
        from: accounts[1],
        data: {
          proposal: '1',
          decision: '2',
          amount: '0',
        },
      },

      {
        type: 'proposal',
        from: accounts[2],
        data: {
          to: [accounts[2]],
          callData: ['0x0'],
          value: [web3.utils.toWei('1.5')],
          title: 'Proposal Test #2',
          description:
            'Send 1.5 ETH to 0x3f943f38b2fbe1ee5daf0516cecfe4e0f8734351',
          tags: ['dxvote'],
          scheme: 'QuickWalletScheme',
        },
      },

      {
        type: 'approve',
        from: accounts[0],
        data: {
          asset: 'DXD',
          address: 'DXDGuild-vault',
          amount: web3.utils.toWei('101'),
        },
      },
      {
        type: 'guild-lockTokens',
        from: accounts[0],
        data: {
          guildName: 'DXDGuild',
          amount: web3.utils.toWei('100'),
        },
      },
      {
        type: 'guild-withdrawTokens',
        from: accounts[0],
        data: {
          guildName: 'DXDGuild',
          amount: web3.utils.toWei('10'),
        },
        time: moment.duration(10, 'minutes').asSeconds() + 1,
      },
      {
        type: 'guild-createProposal',
        from: accounts[0],
        data: {
          guildName: 'DXDGuild',
          to: ['DXDGuild'],
          callData: [
            new web3.eth.Contract(ERC20Guild.abi).methods
              .setPermission(
                [ZERO_ADDRESS],
                [ANY_ADDRESS],
                [ANY_FUNC_SIGNATURE],
                [web3.utils.toWei('5').toString()],
                [true]
              )
              .encodeABI(),
          ],
          value: ['0'],
          totalActions: '1',
          title: 'Proposal Test #0',
          description:
            'Allow call any address and function and send a max of 5 ETH per proposal',
        },
      },
      {
        type: 'guild-voteProposal',
        from: accounts[1],
        data: {
          guildName: 'DXDGuild',
          proposal: 0,
          action: '1',
          votingPower: web3.utils.toWei('90').toString(),
        },
      },
      {
        time: moment.duration(10, 'minutes').asSeconds(),
        type: 'guild-endProposal',
        from: accounts[1],
        data: {
          guildName: 'DXDGuild',
          proposal: 0,
        },
      },

      {
        type: 'approve',
        from: accounts[2],
        data: {
          asset: 'SGT',
          address: 'SnapshotERC20Guild-vault',
          amount: web3.utils.toWei('2'),
        },
      },

      {
        type: 'guild-lockTokens',
        from: accounts[2],
        data: {
          guildName: 'SnapshotERC20Guild',
          amount: web3.utils.toWei('1'),
        },
      },

      {
        type: 'guild-createProposal',
        from: accounts[2],
        data: {
          guildName: 'SnapshotERC20Guild',
          to: ['SnapshotERC20Guild'],
          callData: [
            new web3.eth.Contract(SnapshotERC20Guild.abi).methods
              .setPermission(
                [ZERO_ADDRESS],
                [ANY_ADDRESS],
                [ANY_FUNC_SIGNATURE],
                [web3.utils.toWei('5').toString()],
                [true]
              )
              .encodeABI(),
          ],
          value: ['0'],
          totalActions: '1',
          title: 'Proposal Test #1 to SnapshotERC20Guild',
          description:
            'Allow call any address and function and send a max of 5 ETH per proposal',
        },
      },

      {
        type: 'proposal',
        from: accounts[2],
        data: {
          to: [accounts[2]],
          callData: ['0x0'],
          value: [web3.utils.toWei('1.5')],
          title: 'Proposal Test #3',
          description:
            'Send 1.5 ETH to 0x3f943f38b2fbe1ee5daf0516cecfe4e0f8734351',
          tags: ['dxvote'],
          scheme: 'QuickWalletScheme',
        },
      },
    ],
  };

  const { networkContracts, addresses } = await hre.run('deploy-dxvote', {
    deployconfig: JSON.stringify(deployconfig),
  });

  const developConfig = {
    cache: {
      fromBlock: 0,
      toBlock: 1,
      ipfsHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    contracts: networkContracts,
    recommendedCalls: [],
    proposalTemplates: [],
    proposalTypes: [
      {
        id: 'contributor',
        title: 'Contributor',
        scheme: 'QuickWalletScheme',
      },
      {
        id: 'custom',
        title: 'Custom',
      },
    ],
    contributionLevels: [
      {
        id: '1',
        dxd: 2000,
        stable: 4000,
        rep: 0.1667,
      },
      {
        id: '2',
        dxd: 3000,
        stable: 5000,
        rep: 0.1667,
      },
      {
        id: '3',
        dxd: 4000,
        stable: 6000,
        rep: 0.1667,
      },
      {
        id: '4',
        dxd: 5000,
        stable: 7000,
        rep: 0.1667,
      },
      {
        id: '5',
        dxd: 6000,
        stable: 8000,
        rep: 0.1667,
      },
    ],
    tokens: [
      {
        address: addresses.DXD,
        name: 'DXdao on Localhost',
        decimals: 18,
        symbol: 'DXD',
        fetchPrice: true,
        logoURI:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/5589.png',
      },
      {
        address: addresses.RGT,
        name: 'REP Guild Token on Localhost',
        decimals: 18,
        symbol: 'RGT',
        fetchPrice: true,
        logoURI:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/5589.png',
      },
      {
        address: addresses.SGT,
        name: 'Snapshot Guild Token on Localhost',
        decimals: 18,
        symbol: 'SGT',
        fetchPrice: true,
        logoURI:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/5589.png',
      },
    ],
    guilds: [addresses.DXDGuild, addresses.REPGuild, addresses.SnapshotGuild],
  };

  mkdirSync(path.resolve(__dirname, '../src/configs/localhost'), {
    recursive: true,
  });
  writeFileSync(
    path.resolve(__dirname, '../src/configs/localhost/config.json'),
    JSON.stringify(developConfig, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
