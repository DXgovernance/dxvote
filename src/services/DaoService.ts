import RootStore from '../stores/Root';
import { ContractType } from '../stores/ETHProvider';
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
}
