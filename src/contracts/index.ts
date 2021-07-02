const { getNetworkConfig } = require('../config');
const PermissionRegistry = require("./PermissionRegistry");
const DxController = require("./DxController");
const DxAvatar = require("./DxAvatar");
const DxReputation = require("./DxReputation");
const DXDVotingMachine = require("./DXDVotingMachine");
const GenesisProtocol = require("./GenesisProtocol");
const ERC20 = require("./ERC20");
const Multicall = require("./Multicall");

export const getContracts = async function(network: string, web3: any) {
  const networkConfig = getNetworkConfig(network);
  const avatar = await new web3.eth.Contract(DxAvatar.abi, networkConfig.avatar);
  const controller = await new web3.eth.Contract(DxController.abi, networkConfig.controller);
  const reputation = await new web3.eth.Contract(DxReputation.abi, networkConfig.reputation);
  const permissionRegistry = await new web3.eth.Contract(PermissionRegistry.abi, networkConfig.permissionRegistry);
  const multicall = await new web3.eth.Contract(Multicall.abi, networkConfig.utils.multicall);

  let votingMachines = {};

  if (networkConfig.votingMachines.gen)
    votingMachines[networkConfig.votingMachines.gen.address] = {
      name: "GenesisProtocol",
      contract: await new web3.eth.Contract(GenesisProtocol.abi, networkConfig.votingMachines.gen.address),
      token: await new web3.eth.Contract(ERC20.abi, networkConfig.votingMachines.gen.token)
    }
    
  if (networkConfig.votingMachines.gen2)
    votingMachines[networkConfig.votingMachines.gen2.address] = {
      name: "GenesisProtocol2",
      contract: await new web3.eth.Contract(GenesisProtocol.abi, networkConfig.votingMachines.gen2.address),
      token: await new web3.eth.Contract(ERC20.abi, networkConfig.votingMachines.gen2.token)
    }
  
  if (networkConfig.votingMachines.dxd)
    votingMachines[networkConfig.votingMachines.dxd.address] = {
      name: "DXDVotingMachine",
      contract: await new web3.eth.Contract(DXDVotingMachine.abi, networkConfig.votingMachines.dxd.address),
      token: await new web3.eth.Contract(ERC20.abi, networkConfig.votingMachines.dxd.token)
    }
  
  return { votingMachines, avatar, controller, reputation, permissionRegistry, multicall };
  
}
