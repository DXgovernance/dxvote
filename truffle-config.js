const HDWalletProvider = require('truffle-hdwallet-provider')	
require('dotenv').config();

mnemonic = process.env.REACT_APP_KEY_MNEMONIC;
infuraApiKey = process.env.REACT_APP_KEY_INFURA_API_KEY;

module.exports = {	
  contracts_directory: "./contracts",
  contracts_build_directory: "./contracts/build",
  networks: {	
    development: {	
      network_id: '*',	
      host: 'localhost',	
      port: 8545,	
      gas: 9000000,	
      gasPrice: 10000000000 //10 Gwei	
    },	
    mainnet: {	
      provider: function () {	
        return new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${infuraApiKey}`)	
      },	
      network_id: '1',	
      gas: 9000000,	
      gasPrice: 10000000000 //10 Gwei	
    },	
    rinkeby: {	
      provider: function () {	
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraApiKey}`)	
      },	
      network_id: '4',	
      gas: 9000000,	
      gasPrice: 10000000000 //10 Gwei	
    },	
    ropsten: {	
      provider: function () {	
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraApiKey}`)	
      },	
      network_id: '3',	
      gas: 8000000,	
      gasPrice: 10000000000 //10 Gwei	
    },	
    kovan: {	
      provider: function () {	
        return new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/${infuraApiKey}`)	
      },	
      network_id: '42',	
      gas: 9000000,	
      gasPrice: 10000000000 //10 Gwei	
    }	
  },	
  build: {},	
  compilers: {	
    solc: {	
      version: '0.5.17',
      settings: {
        evmVersion: 'constantinople',
      }
    }
  },	
  solc: {	
    optimizer: {	
      enabled: true,	
      runs: 200	
    }
  },	
}
