import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import { BigNumber } from '../utils/bignumber';
import { bnum } from '../utils/helpers';

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
    if (!callDecoded) {
      return "Couldnt decode call";
    } else {
      switch (callDecoded.function.name) {
        case "mintReputation":
          return "Mint "+callDecoded.args[0]+" REP to "+callDecoded.args[1];
        case "burnReputation":
          return "Burn "+callDecoded.args[0]+" REP of "+callDecoded.args[1];
        default:
          return "Generic Call to "+callDecoded.args[0]+" with data of "+callDecoded.args[1]+" using a value of "+library.utils.fromWei(callDecoded.args[3]);
      }
    }
  }
  
  getRepAt(atBlock: number): {
    userRep: BigNumber,
    totalSupply: BigNumber
  } {
    const { daoStore, providerStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    const repEvents = daoStore.cache.daoInfo.repEvents;
    let userRep = bnum(0), totalSupply = bnum(0);
    
    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i].block <= atBlock) {
        if (repEvents[i].type === 'Mint') {
          totalSupply = totalSupply.plus(repEvents[i].amount)
          if (repEvents[i].account == account)
            userRep = userRep.plus(repEvents[i].amount)
        } else {
          totalSupply = totalSupply.minus(repEvents[i].amount)
          if (repEvents[i].account == account)
            userRep = userRep.minus(repEvents[i].amount)
        }
      } else {
        break;
      }      
    }
    
    
    return { userRep, totalSupply };
  }
  
  async getUserBalances(userAddress: string){
    const { configStore, providerStore } = this.rootStore;
    
    const reputation = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Reputation,
      configStore.getReputationAddress()
    )
    
    const votingMachine = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getVotingMachineAddress()
    )
    
    const dxd = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      await votingMachine.methods.stakingToken().call()
    )
      
    return {
      rep: await reputation.methods.balanceOf(userAddress).call(),
      dxd: await dxd.methods.balanceOf(userAddress).call()
    };
  }
}
