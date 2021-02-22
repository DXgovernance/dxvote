const RINKEBY_CONFIG = require('../rinkeby.json');

export const getConfig = function(network) {
  if (network === 'development') {
    return {
      avatar: process.env.REACT_APP_AVATAR_ADDRESS.replace(/["']/g, ""),
      controller: process.env.REACT_APP_CONTROLLER_ADDRESS.replace(/["']/g, ""),
      reputation: process.env.REACT_APP_REPUTATION_ADDRESS.replace(/["']/g, ""),
      votingMachine: process.env.REACT_APP_VOTING_MACHINE_ADDRESS.replace(/["']/g, ""),
      votingMachineToken: process.env.REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS.replace(/["']/g, ""),
      schemes: {
        masterWallet: process.env.REACT_APP_MASTER_WALLET_SCHEME_ADDRESS.replace(/["']/g, ""),
        quickWallet: process.env.REACT_APP_QUICK_WALLET_SCHEME_ADDRESS.replace(/["']/g, "")
      },
      multicall: process.env.REACT_APP_MULTICALL_ADDRESS.replace(/["']/g, "")
    }
  } else if (network === 'rinkeby') {
    return {
      avatar: RINKEBY_CONFIG.avatar, 
      controller: RINKEBY_CONFIG.controller, 
      reputation: RINKEBY_CONFIG.reputation, 
      votingMachine: RINKEBY_CONFIG.votingMachine, 
      votingMachineToken: RINKEBY_CONFIG.votingMachineToken,
      schemes: {
        masterWallet: RINKEBY_CONFIG.masterWalletScheme, 
        quickWallet: RINKEBY_CONFIG.quickWalletScheme
      },
      multicall: RINKEBY_CONFIG.multicall,
    }
  } else {
    return {};
  }
}
