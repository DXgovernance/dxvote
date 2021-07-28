import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import { BigNumber } from '../utils/bignumber';
import { bnum, ERC20_TRANSFER_SIGNATURE, ZERO_ADDRESS } from '../utils/helpers';
import { normalizeBalance } from '../utils/token';

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
    const { abiService, providerStore, configStore } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    const callDecoded = abiService.decodeCall(ContractType.Controller, callData);
    if (!callDecoded) {
      return "Couldnt decode call";
    } else {
      switch (callDecoded.function.name) {
        case "registerScheme":
          return "Register scheme "+callDecoded.args[0]+" with params hash "+callDecoded.args[1]+" and permissions "+callDecoded.args[2];
        case "unregisterScheme":
          return "Unregister scheme "+callDecoded.args[0];
        case "externalTokenTransfer":
          return "Send "+callDecoded.args[2]+" tokens of contract "+callDecoded.args[0]+" to "+callDecoded.args[1];
        case "sendEther":
          return "Send "+normalizeBalance(callDecoded.args[0], 18)+" ETH to "+callDecoded.args[1];
        case "mintReputation":
          return "Mint "+normalizeBalance(callDecoded.args[0], 18)+" REP to "+callDecoded.args[1];
        case "burnReputation":
          return "Burn "+normalizeBalance(callDecoded.args[0], 18)+" REP of "+callDecoded.args[1];
        case "genericCall":
          const genericCallData = callDecoded.args[1];
          const recommendedCallUsed = recommendedCalls.find((recommendedCall) => {
            return (
              callDecoded.args[0] == recommendedCall.to
              && callDecoded.args[1].substring(0,10) == recommendedCall.functionSignature
            )
          });
          if (recommendedCallUsed) {
            const callParameters = library.eth.abi.decodeParameters(
              recommendedCallUsed.params.map((param) => param.type),
              "0x"+callDecoded.args[1].substring(10)
            );
            if (callParameters.__length__)
              delete callParameters.__length__;
              
            return `To: ${recommendedCallUsed.toName}
            Function:${recommendedCallUsed.functionName}
            Params: ${JSON.stringify(Object.keys(callParameters).map((paramIndex) => callParameters[paramIndex]))}
            `;
          } else if (genericCallData.substring(0,10) == ERC20_TRANSFER_SIGNATURE) {
            const transferParams = library.eth.abi.decodeParameters(['address', 'uint256'], "0x"+genericCallData.substring(10));
            return "Token "+callDecoded.args[0]+" transfer to "+transferParams[0]+" of "+transferParams[1];
          } else {
            return "Generic Call to "+callDecoded.args[0]+" with data of "+genericCallData+" using a value of "+library.utils.fromWei(callDecoded.args[3]);
          }
      }
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
