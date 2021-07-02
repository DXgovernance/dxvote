require('dotenv').config();
require('@nomiclabs/hardhat-truffle5');
require('hardhat-dependency-compiler');

const MNEMONIC = process.env.REACT_APP_KEY_MNEMONIC;
const INFURA_API_KEY = process.env.REACT_APP_KEY_INFURA_API_KEY;
const ALCHEMY_API_KEY = process.env.REACT_APP_KEY_ALCHEMY_API_KEY;

module.exports = {
  paths: {
    sources: "./src", // Use src folder isntead of contracts to avoid having empty conrtracts folder
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
      'dxdao-contracts/contracts/utils/Multicall.sol',
      'dxdao-contracts/contracts/test/ERC20Mock.sol',
      '@daostack/infra/contracts/votingMachines/GenesisProtocol.sol'
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
      }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: { mnemonic: MNEMONIC },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      gasLimit: 9000000,
      gasPrice: 10000000000, // 10 gwei
    },
    mainnet: {
      url: ALCHEMY_API_KEY.length > 0
        ? `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
        : `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      timeout: 10000
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
      url: `https://rpc.xdaichain.com/`,
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
  }
};
