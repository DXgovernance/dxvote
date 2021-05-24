const { getNetworkConfig } = require('../config');
const PermissionRegistry = require("./PermissionRegistry");
const DxController = require("./DxController");
const DxAvatar = require("./DxAvatar");
const DxReputation = require("./DxReputation");
const DXDVotingMachine = require("./DXDVotingMachine");
const ERC20 = require("./ERC20");

export const getContracts = async function(network: string, web3: any) {
  const contractsAddresses = getNetworkConfig(network);
  const votingMachine = await new web3.eth.Contract(DXDVotingMachine.abi, contractsAddresses.votingMachine);
  const avatar = await new web3.eth.Contract(DxAvatar.abi, contractsAddresses.avatar);
  const controller = await new web3.eth.Contract(DxController.abi, contractsAddresses.controller);
  const reputation = await new web3.eth.Contract(DxReputation.abi, contractsAddresses.reputation);
  const permissionRegistry = await new web3.eth.Contract(PermissionRegistry.abi, contractsAddresses.permissionRegistry);
  const dxd = await new web3.eth.Contract(ERC20.abi, contractsAddresses.votingMachineToken);

  return { votingMachine, avatar, controller, reputation, permissionRegistry, dxd };
}
