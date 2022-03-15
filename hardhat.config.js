const moment = require('moment');
require('@nomiclabs/hardhat-truffle5');
require('hardhat-dependency-compiler');
require("./node_modules/dxdao-contracts/scripts/deploy-dxvote");
require('@typechain/hardhat')

const MNEMONIC = "dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao";
const INFURA_API_KEY = process.env.REACT_APP_KEY_INFURA_API_KEY;
const ALCHEMY_API_KEY = process.env.REACT_APP_KEY_ALCHEMY_API_KEY || "";

module.exports = {
  paths: {
    sources: "./src", // Use src folder instead of contracts to avoid having empty contracts folder
  },
  dependencyCompiler: {
    paths: [
      'dxdao-contracts/contracts/dxdao/DxAvatar.sol',
      'dxdao-contracts/contracts/dxdao/DxController.sol',
      'dxdao-contracts/contracts/dxdao/DxReputation.sol',
      'dxdao-contracts/contracts/dxdao/DxToken.sol',
      'dxdao-contracts/contracts/dxvote/DXDVotingMachine.sol',
      'dxdao-contracts/contracts/dxvote/WalletScheme.sol',
      'dxdao-contracts/contracts/dxvote/PermissionRegistry.sol',
      'dxdao-contracts/contracts/dxvote/utils/DXDVestingFactory.sol',
      'dxdao-contracts/contracts/dxvote/utils/DXdaoNFT.sol',
      'dxdao-contracts/contracts/utils/Multicall.sol',
      'dxdao-contracts/contracts/test/ERC20Mock.sol',
      'dxdao-contracts/contracts/daostack/universalSchemes/ContributionReward.sol',
      'dxdao-contracts/contracts/daostack/universalSchemes/SchemeRegistrar.sol',
      'dxdao-contracts/contracts/daostack/utils/Redeemer.sol',
      'dxdao-contracts/contracts/daostack/votingMachines/GenesisProtocol.sol',
      'dxdao-contracts/contracts/erc20guild/ERC20Guild.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/DXDGuild.sol',
      'dxdao-contracts/contracts/erc20guild/implementations/SnapshotRepERC20Guild.sol'
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.5.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: '0.8.8',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      }
    ]
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
      url: ALCHEMY_API_KEY.length > 0
        ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
        : `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      timeout: 20000
    },
    rinkeby: {
      url: ALCHEMY_API_KEY.length > 0
        ? `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
        : `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 1000000000 // 1 gwei
    },
    xdai: {
      url: `https://poa-xdai-archival.gateway.pokt.network/v1/lb/61b4a50ec922b9003a3a93dc`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 17000000,
      gasPrice: 2000000000, // 2 gwei
      timeout: 60000
    },
    arbitrum: {
      url: `https://arb1.arbitrum.io/rpc`,
      accounts: { mnemonic: MNEMONIC },
      chainId: 42161,
      timeout: 60000
    },
    arbitrumTestnet: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      accounts: { mnemonic: MNEMONIC },
      chainId: 421611,
      timeout: 60000
    }
  },
  typechain: {
    outDir: 'src/types/contracts',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
  },
};
