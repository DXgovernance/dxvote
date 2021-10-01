import { Interface } from 'ethers/utils';
import RootContext from '../contexts';

export const schema = {
  Avatar: require('../contracts/DxAvatar').abi,
  Controller: require('../contracts/DxController').abi,
  VotingMachine: require('../contracts/GenesisProtocol').abi,
  DXDVotingMachine: require('../contracts/DXDVotingMachine').abi,
  Reputation: require('../contracts/DxReputation').abi,
  WalletScheme: require('../contracts/WalletScheme').abi,
  ERC20: require('../contracts/ERC20').abi,
  PermissionRegistry: require('../contracts/PermissionRegistry').abi,
  Multicall: require('../contracts/Multicall').abi,
  ContributionReward: require('../contracts/ContributionReward').abi,
  SchemeRegistrar: require('../contracts/SchemeRegistrar').abi,
  Redeemer: require('../contracts/Redeemer').abi,
};

export default class ABIService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;
  }

  getAbi(contractType: string) {
    return schema[contractType];
  }
  /**
   * @todo prevent repeated etherscan API call
   * @todo check if etherscan api token has been supplied
   * @param data Transaction call data
   * @param contractType e.g. controller/avatar/votingMachine etc
   * @param to contract address
   * @returns
   */
  async decodeCall(data: string, contractType?: string, to?: string) {
    const { providerStore, etherscanService } = this.context;
    let etherscanABI;

    try {
      if (to) {
        etherscanABI = (await etherscanService.getContractABI(to)).data.result;
      }
    } catch (error) {
      console.log(error);
    }

    const { library } = providerStore.getActiveWeb3React();

    const contractInterface = new Interface(
      etherscanABI ? etherscanABI : this.getAbi(contractType)
    );
    const functionSignature = data.substring(0, 10);
    for (const functionName in contractInterface.functions) {
      if (
        contractInterface.functions[functionName].sighash === functionSignature
      ) {
        return {
          function: contractInterface.functions[functionName],
          args: library.eth.abi.decodeParameters(
            contractInterface.functions[functionName].inputs.map(input => {
              return input.type;
            }),
            data.substring(10)
          ),
        };
      }
    }
    return undefined;
  }
}
