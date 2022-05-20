const moment = require('moment');
require('@nomiclabs/hardhat-truffle5');
require('hardhat-dependency-compiler');
require('./node_modules/dxdao-contracts/scripts/deploy-dxdao-contracts');
require('./node_modules/dxdao-contracts/scripts/actions-dxdao-contracts');
require('@typechain/hardhat');

const MNEMONIC =
  'cream core pear sure dinner indoor citizen divorce sudden captain subject remember';


// # Accounts
// # ========
// # Account #0: 0x9578e973bba0cc33bdbc93c7f77bb3fe6d47d68a (10000 ETH)
// # Private Key #0: 0x2edaf5755c340d57c68ab5c084a0afd867caafcbcf556838f404468e2ad0ea94

// # Account #1: 0xc5b20ade9c9cd5e0cc087c62b26b815a4bc1881f (10000 ETH)
// # Private Key #1: 0x40126ad770c1ff59937436ddab2872193c01d5353213d297fdb0ea2c13b5981e

// # Account #2: 0xaf8eb8c3a5d9d900aa0b98e3df0bcc17d3c5f698 (10000 ETH)
// # Private Key #2: 0x4db6b61624bd4a9bf87ff59e7fca0991b02ff605664a3ad97dc237c84ba0e013

// # Account #3: 0x84eeb305da0a4309a696d43de9f79f04e66eb4f8 (10000 ETH)
// # Private Key #3: 0x6d8b1b46346a00fec52fd0e2edba75592e8814b11aec5815ec0f6b882e072131

// # Account #4: 0x1b929bdde0fb3b7b759696f23d6cac0963d326e6 (10000 ETH)
// # Private Key #4: 0x19ea21f217094f12da6bab83fe697f902caea0dcf5a2914d7c000b73938f7d85

// # Account #5: 0xd507743abcdb265f5fcef125e3f6cf7250cfe9da (10000 ETH)
// # Private Key #5: 0x6a944885ff4551fd546c59a2322a967af9906f596f60ecd110505c278f464f6e

// # Account #6: 0x9af7a0d34fcf09a735ddaa03adc825398a6557ae (10000 ETH)
// # Private Key #6: 0x4299ee99407089bfc51e829734c0f6c1b366f515d5ddb5ece4f880a2f8fd430c

// # Account #7: 0x2154cdc3632db21a2635819afa450f2dda08aebd (10000 ETH)
// # Private Key #7: 0x0e7ee7881e497062427ed392d310f09ca993fa964040c751cc383c10f55efc7c

// # Account #8: 0x73c8825893ba6b197f883f60a20b4926c0f32a2c (10000 ETH)
// # Private Key #8: 0xd84954f2cea66fd01a872496f25ddb86db79ee81366609fbcff8087c9739b63a

// # Account #9: 0x73d2888f96bc0eb530490ca5342d0c274d95654d (10000 ETH)
// # Private Key #9: 0xd20a2f6a6656d291ca4c4e6121b479db81b3b281e64707ff4a068acf549dc03c

// # Account #10: 0xf8a3681248934f1139be67e0c22a6af450eb9d7c (10000 ETH)
// # Private Key #10: 0x8188d555d06262bfa3a343fa809b59b6368f02aa5a1ac5a3d2cb24e18e2b556e

const INFURA_API_KEY = process.env.REACT_APP_KEY_INFURA_API_KEY;
const ALCHEMY_API_KEY = process.env.REACT_APP_KEY_ALCHEMY_API_KEY || '';

module.exports = {
  paths: {
    sources: './src', // Use src folder instead of contracts to avoid having empty contracts folder
  },
  dependencyCompiler: {
    paths: [
      'dxdao-contracts/contracts/dxdao/DxAvatar.sol',
      'dxdao-contracts/contracts/dxdao/DxController.sol',
      'dxdao-contracts/contracts/dxdao/DxReputation.sol',
      'dxdao-contracts/contracts/dxdao/DxToken.sol',
      'dxdao-contracts/contracts/dxvote/DXDVotingMachine.sol',
      'dxdao-contracts/contracts/dxvote/WalletScheme.sol',
      'dxdao-contracts/contracts/dxvote/utils/ERC20VestingFactory.sol',
      'dxdao-contracts/contracts/dxvote/utils/ERC721Factory.sol',
      'dxdao-contracts/contracts/utils/PermissionRegistry.sol',
      'dxdao-contracts/contracts/utils/Multicall.sol',
      'dxdao-contracts/contracts/test/ERC20Mock.sol',
      'dxdao-contracts/contracts/daostack/universalSchemes/ContributionReward.sol',
      'dxdao-contracts/contracts/daostack/universalSchemes/SchemeRegistrar.sol',
      'dxdao-contracts/contracts/daostack/utils/Redeemer.sol',
      'dxdao-contracts/contracts/daostack/votingMachines/GenesisProtocol.sol',
      'dxdao-contracts/contracts/erc20guild/ERC20Guild.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/DXDGuild.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/SnapshotRepERC20Guild.sol',
      'dxdao-contracts/contracts/erc20guild/utils/GuildRegistry.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/SnapshotERC20Guild.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/EnforcedBinaryGuild.sol',
      // 'dxdao-contracts/contracts/erc20guild/implementations/EnforcedBinarySnapshotERC20Guild.sol',
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.5.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.8',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: { mnemonic: MNEMONIC },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: false,
      initialDate: moment.unix(0).toDate().toString(),
      mining: {
        auto: true,
        interval: 500,
      },
    },
    mainnet: {
      url:
        ALCHEMY_API_KEY.length > 0
          ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
          : `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      timeout: 20000,
    },
    rinkeby: {
      url:
        ALCHEMY_API_KEY.length > 0
          ? `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
          : `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 1000000000, // 1 gwei
    },
    xdai: {
      url: `https://poa-xdai-archival.gateway.pokt.network/v1/lb/61b4a50ec922b9003a3a93dc`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 17000000,
      gasPrice: 2000000000, // 2 gwei
      timeout: 60000,
    },
    arbitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
      accounts: { mnemonic: MNEMONIC },
      chainId: 42161,
      timeout: 60000,
    },
    arbitrumTestnet: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      accounts: { mnemonic: MNEMONIC },
      chainId: 421611,
      timeout: 60000,
    },
  },
  typechain: {
    outDir: 'src/types/contracts',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
  },
};

