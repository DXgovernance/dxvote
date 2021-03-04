import RootStore from '../stores';
import { ContractType } from '../stores/ETHProvider';

export interface EventCall {
  contractType: ContractType;
  address: string;
  eventName: string;
  fromBlock: number;
  toBlock: number;
  executed?: boolean;
}

export default class EventsService {
  rootStore: RootStore;  

  activeEventsCalls: EventCall[];
    
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.activeEventsCalls = [];
  }
  
  async getEvents(
    contractType: ContractType,
    address: string,
    eventName: string,
    fromBlock: number,
    toBlock: number
  ){
    const { providerStore } = this.rootStore;
    const contract = providerStore.getContract(providerStore.getActiveWeb3React(), contractType, address);
    console.log('Getting event',eventName, fromBlock, toBlock);
    return await contract.getPastEvents(eventName, {fromBlock: fromBlock, toBlock: toBlock });
  }
  
  async executeActiveEventCalls() {
    return await Promise.all(this.activeEventsCalls.map(async (activeEventCall) => {
      return await this.getEvents(
        activeEventCall.contractType,
        activeEventCall.address,
        activeEventCall.eventName,
        activeEventCall.fromBlock,
        activeEventCall.toBlock
      )
    }));
  }

  addEventsCalls(events: EventCall[]) {
    events.forEach(event => this.addEventCall(event));
  }

  addEventCall(event: EventCall) {
    this.activeEventsCalls.push(event);
  }

  resetActiveEventCalls() {
    this.activeEventsCalls = [];
  }
  
}
