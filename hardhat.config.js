require('dotenv').config();
require('@nomiclabs/hardhat-truffle5');
require('hardhat-dependency-compiler');

const MNEMONIC = process.env.REACT_APP_KEY_MNEMONIC;
const INFURA_PROJECT_ID = process.env.REACT_APP_KEY_INFURA_API_KEY;

module.exports = {
  paths: {
    sources: "./src", // Use src folder isntead of contracts to avoid having empty conrtracts folder
  },
  dependencyCompiler: {
    paths: [
      'dxdao-contracts/contracts/dxdao/DxAvatar.sol',
      'dxdao-contracts/contracts/dxdao/DxController.sol',
      'dxdao-contracts/contracts/dxdao/DxReputation.sol',
      'dxdao-contracts/contracts/dxdao/DXDVotingMachine.sol',
      'dxdao-contracts/contracts/dxdao/DxToken.sol',
      'dxdao-contracts/contracts/utils/Multicall.sol',
      'dxdao-contracts/contracts/schemes/WalletScheme.sol',
      'dxdao-contracts/contracts/schemes/PermissionRegistry.sol',
      'dxdao-contracts/contracts/test/ERC20Mock.sol'
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
      timeout: 60000,
      
      // Uses the time now minus one hour in local development, you might need to disable it.
      // For some reason the EVM date was one hour ahead my local system date.
      initialDate: new Date((new Date().getTime()) - 3600 * 1000).toString()
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: { mnemonic: MNEMONIC },
      gasLimit: 9000000,
      gasPrice: 1000000000 // 1 gwei
    },
    "arbitrum-testnet-v5": {
      url: 'https://kovan5.arbitrum.io/rpc',
      accounts: { mnemonic: MNEMONIC },
      gasPrice: 0,
      chainId: 144545313136048
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
  }
};
