const PermissionRegistry = require('./PermissionRegistry');
const DxController = require('./DxController');
const DxAvatar = require('./DxAvatar');
const DxReputation = require('./DxReputation');
const DXDVotingMachine = require('./DXDVotingMachine');
const GenesisProtocol = require('./GenesisProtocol');
const ERC20 = require('./ERC20');
const Multicall = require('./Multicall');
const VestingFactory = require('./DXDVestingFactory');

export const getContracts = async function (
  networkConfig: NetworkContracts,
  web3: any
) {
  const avatar = await new web3.eth.Contract(
    DxAvatar.abi,
    networkConfig.avatar
  );
  const controller = await new web3.eth.Contract(
    DxController.abi,
    networkConfig.controller
  );
  const reputation = await new web3.eth.Contract(
    DxReputation.abi,
    networkConfig.reputation
  );
  const permissionRegistry = await new web3.eth.Contract(
    PermissionRegistry.abi,
    networkConfig.permissionRegistry
  );
  const multicall = await new web3.eth.Contract(
    Multicall.abi,
    networkConfig.utils.multicall
  );

  let votingMachines = {};

  for (const votingMachineAddress in networkConfig.votingMachines) {

    if (networkConfig.votingMachines[votingMachineAddress].type == "GenesisProtocol")
      votingMachines[votingMachineAddress] = {
        name: 'GenesisProtocol',
        contract: await new web3.eth.Contract(
          GenesisProtocol.abi,
          votingMachineAddress
        ),
        token: await new web3.eth.Contract(
          ERC20.abi,
          networkConfig.votingMachines[votingMachineAddress].token
        ),
      };

    else if (networkConfig.votingMachines[votingMachineAddress].type == "DXDVotingMachine")
      votingMachines[votingMachineAddress] = {
        name: 'DXDVotingMachine',
        contract: await new web3.eth.Contract(
          DXDVotingMachine.abi,
          votingMachineAddress
        ),
        token: await new web3.eth.Contract(
          ERC20.abi,
          networkConfig.votingMachines[votingMachineAddress].token
        ),
      };
  }

  const vestingFactory = await new web3.eth.Contract(
    VestingFactory.abi,
    networkConfig.utils.dxdVestingFactory
  );

  return {
    votingMachines,
    avatar,
    controller,
    reputation,
    permissionRegistry,
    multicall,
    vestingFactory,
  };
};
