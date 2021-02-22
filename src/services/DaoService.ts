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
  
  async getProposalEvents(proposalId: string, creationBlock: number){
    const { configStore, providerStore } = this.rootStore;
    
    const votingMachine = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getVotingMachineAddress()
    )
    
    // Get events at maximum a 30days time of proposal
    const toBlock = Math.min(creationBlock + 190000, await providerStore.getCurrentBlockNumber());
    const stakes = await votingMachine.getPastEvents(
    "Stake",
    {
      filter: { _proposalId: proposalId },
      fromBlock: creationBlock,
      toBlock: toBlock > 0 ? toBlock : 0
    });
    const votes = await votingMachine.getPastEvents(
    "VoteProposal",
    {
      filter: { _proposalId: proposalId },
      fromBlock: creationBlock,
      toBlock: toBlock > 0 ? toBlock : 0
    })
    
    return {stakes, votes};
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
}
