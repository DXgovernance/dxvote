import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import { BigNumber } from '../utils/bignumber';
import { bnum, ERC20_TRANSFER_SIGNATURE } from '../utils/helpers';

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
      configStore.getNetworkConfig().controller
    )
    const avatarAddress = configStore.getNetworkConfig().avatar;
    return controller.methods.genericCall(to, callData, avatarAddress, value).encodeABI();
  }
  
  decodeControllerCall(callData: string){
    const { abiService, providerStore } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    const callDecoded = abiService.decodeCall(ContractType.Controller, callData);
    if (!callDecoded) {
      return "Couldnt decode call";
    } else {
      switch (callDecoded.function.name) {
        case "mintReputation":
          return "Mint "+callDecoded.args[0]+" REP to "+callDecoded.args[1];
        case "burnReputation":
          return "Burn "+callDecoded.args[0]+" REP of "+callDecoded.args[1];
        case "genericCall":
          const genericCallData = callDecoded.args[1];
          
          // TO DO: Decode more functions here 
          if (genericCallData.substring(0,10) == ERC20_TRANSFER_SIGNATURE) {
            const transferParams = library.eth.abi.decodeParameters(['address', 'uint256'], "0x"+genericCallData.substring(10));
            return "Token "+callDecoded.args[0]+" transfer to "+transferParams[0]+" of "+transferParams[1];
          } else {
            return "Generic Call to "+callDecoded.args[0]+" with data of "+genericCallData+" using a value of "+library.utils.fromWei(callDecoded.args[3]);
          }
      }
    }
  }
  
  getRepAt(atBlock: number, l2BlockNumber: boolean = false): {
    userRep: BigNumber,
    totalSupply: BigNumber
  } {
    const { daoStore, providerStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let userRep = bnum(0), totalSupply = bnum(0);

    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i][l2BlockNumber ? 'l2BlockNumber' : 'l1BlockNumber'] <= atBlock) {
        if (repEvents[i].event === 'Mint') {
          totalSupply = totalSupply.plus(repEvents[i].amount)
          if (repEvents[i].account == account)
            userRep = userRep.plus(repEvents[i].amount)
        } else if (repEvents[i].event === 'Burn') {
          totalSupply = totalSupply.minus(repEvents[i].amount)
          if (repEvents[i].account == account)
            userRep = userRep.minus(repEvents[i].amount)
        }
      }
    }


    return { userRep, totalSupply };
  }
}
