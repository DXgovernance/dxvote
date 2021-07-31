import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import {
  BigNumber,
  bnum,
  ZERO_ADDRESS,
  ANY_ADDRESS,
  ERC20_TRANSFER_SIGNATURE,
  ERC20_APPROVE_SIGNATURE,
  normalizeBalance
} from '../utils';

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
  
  decodeWalletSchemeCall(from: string, to: string, data: string, value: BigNumber){
    const { abiService, providerStore, configStore } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    let functionSignature = data.substring(0,10);
    const controllerCallDecoded = abiService.decodeCall(ContractType.Controller, data);
    let asset = ZERO_ADDRESS;
    if (controllerCallDecoded && controllerCallDecoded.function.name == "genericCall") {
      to = controllerCallDecoded.args[0];
      data = "0x"+controllerCallDecoded.args[1].substring(10);
      value = bnum(controllerCallDecoded.args[3]);
      functionSignature = controllerCallDecoded.args[1].substring(0,10);
    } else {
      data = "0x"+data.substring(10);
    }
  
    if (functionSignature == ERC20_TRANSFER_SIGNATURE || functionSignature == ERC20_APPROVE_SIGNATURE) {
      asset = to;
    }
    
    const recommendedCallUsed = recommendedCalls.find((recommendedCall) => {
      return (
        asset == recommendedCall.asset
        && (ANY_ADDRESS == recommendedCall.from || from == recommendedCall.from)
        && (to == recommendedCall.to)
        && functionSignature == library.eth.abi.encodeFunctionSignature(recommendedCall.functionName)
      )
    });

    if (recommendedCallUsed) {
      const callParameters = library.eth.abi
        .decodeParameters(recommendedCallUsed.params.map((param) => param.type), data);
      
      if (callParameters.__length__)
        delete callParameters.__length__;
      
      let decodedCallText = "";
      
      if (recommendedCallUsed.decodeText && recommendedCallUsed.decodeText.length > 0) {
        decodedCallText = recommendedCallUsed.decodeText;
        for (let paramIndex = 0; paramIndex < recommendedCallUsed.params.length; paramIndex++)
          if (recommendedCallUsed.params[paramIndex].decimals)
            decodedCallText = decodedCallText
              .replaceAll(
                "[PARAM_"+paramIndex+"]",
                "<italic>"+normalizeBalance(callParameters[paramIndex], recommendedCallUsed.params[paramIndex].decimals)+"</italic>"
              );
          else
            decodedCallText = decodedCallText
              .replaceAll("[PARAM_"+paramIndex+"]", "<italic>"+callParameters[paramIndex]+"</italic>");
      } 
      
      return `<strong>Description</strong>:${decodedCallText}
      <strong>To</strong>: ${recommendedCallUsed.toName} <small>${recommendedCallUsed.to}</small>
      <strong>Function</strong>: ${recommendedCallUsed.functionName} <small>${library.eth.abi.encodeFunctionSignature(recommendedCallUsed.functionName)}</small>
      <strong>Params</strong>: ${JSON.stringify(Object.keys(callParameters).map((paramIndex) => callParameters[paramIndex]))}
      <strong>Data</strong>: ${data} `
      
    } else {
      return `<strong>From</strong>: ${from}
      <strong>To</strong>: ${to}
      <strong>Data</strong>: 0x${data.substring(10)}
      <strong>Value</strong>: ${normalizeBalance(bnum(value))}`
    }
    
  }
  
  getRepAt(userAddress: string = ZERO_ADDRESS, atBlock: number = 0): {
    userRep: BigNumber,
    totalSupply: BigNumber
  } {
    const { daoStore, providerStore, configStore } = this.rootStore;
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let userRep = bnum(0), totalSupply = bnum(0);
    if (atBlock == 0)
      atBlock = providerStore.getCurrentBlockNumber();
    const inL2 = configStore.getActiveChainName().indexOf('arbitrum') > -1

    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i][inL2 ? 'l2BlockNumber' : 'l1BlockNumber'] <= atBlock) {
        if (repEvents[i].event === 'Mint') {
          totalSupply = totalSupply.plus(repEvents[i].amount)
          if (repEvents[i].account == userAddress)
            userRep = userRep.plus(repEvents[i].amount)
        } else if (repEvents[i].event === 'Burn') {
          totalSupply = totalSupply.minus(repEvents[i].amount)
          if (repEvents[i].account == userAddress)
            userRep = userRep.minus(repEvents[i].amount)
        }
      }
    }
    return { userRep, totalSupply };

  }
    
  getUsersRep(): {
    [userAddress: string]: BigNumber
  } {
    const { daoStore, providerStore } = this.rootStore;
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let users = {}
    const atBlock = providerStore.getCurrentBlockNumber();

    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i].l1BlockNumber <= atBlock) {
        if (repEvents[i].event === 'Mint') {
          if (!users[repEvents[i].account])
            users[repEvents[i].account] = repEvents[i].amount;
          else
            users[repEvents[i].account] = users[repEvents[i].account].plus(repEvents[i].amount);
        } else if (repEvents[i].event === 'Burn') {
          if (users[repEvents[i].account])
            users[repEvents[i].account] = users[repEvents[i].account].minus(repEvents[i].amount);
        }
      }
    }
    return users;
  }
}
