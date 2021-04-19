import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import { BigNumber } from '../utils/bignumber';

export default class DaoService {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  encodeControllerGenericCall(
    to: string,
    callData: string,
    value: BigNumber
  ){
    const { providerStore, configStore } = this.rootStore;
    const controller = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Controller,
      configStore.getControllerAddress()
    )
    const avatarAddress = configStore.getAvatarAddress();
    return controller.methods.genericCall(to, callData, avatarAddress, value).encodeABI();
  }
  
  decodeControllerCall(callData: string){
    const { abiService, providerStore } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    const callDecoded = abiService.decodeCall(ContractType.Controller, callData);
    
    switch (callDecoded.function.name) {
      case "mintReputation":
        return {
          text: "Mint "+callDecoded.args[0]+" REP to "+callDecoded.args[1]
        };
      case "burnReputation":
        return {
          text: "Burn "+callDecoded.args[0]+" REP of "+callDecoded.args[1]
        };
      default:
        return {
          text: "Generic Call to "+callDecoded.args[0]+" with data of "+callDecoded.args[1]+" uinsg value of "+library.utils.fromWei(callDecoded.args[3])
        };
    }
  }
  
  async getRepAt(atBlock: string){
    const { configStore, providerStore } = this.rootStore;
    
    const reputation = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Reputation,
      configStore.getReputationAddress()
    )
      
    return {
      userRep: await reputation.methods.balanceOfAt(providerStore.getActiveWeb3React().account, atBlock).call(),
      totalSupply: await reputation.methods.totalSupplyAt(atBlock).call()
    };
  }
  
  async getUserBalances(userAddress: string){
    const { configStore, providerStore } = this.rootStore;
    
    const reputation = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Reputation,
      configStore.getReputationAddress()
    )
    
    const dxd = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      configStore.getVotingMachineTokenAddress()
    )
      
    return {
      rep: await reputation.methods.balanceOf(userAddress).call(),
      dxd: await dxd.methods.balanceOf(userAddress).call()
    };
  }
}
