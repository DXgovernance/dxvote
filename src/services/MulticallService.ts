import { Interface } from 'ethers/utils';
import RootStore from '../stores';
import { ContractType } from '../stores/Provider';
import { Call } from '../types';


export default class MulticallService {
  root: RootStore;

  activeCalls: Call[];
  activeCallsRaw: any[];

  constructor(root: RootStore) {
    this.root = root;
    this.resetActiveCalls();
  }

  // Add call additions and removals
  async executeCalls(calls?: Call[], rawCalls?: any[]) {
    const { providerStore, configStore } = this.root;

    const multi = providerStore.getContract(
      providerStore.getActiveWeb3React(),
      ContractType.Multicall,
      configStore.getNetworkConfig().utils.multicall
    );

    const response = await multi.methods.aggregate(rawCalls || this.activeCallsRaw).call();
    return {
      calls: calls || this.activeCalls,
      results: response.returnData,
      blockNumber: response.blockNumber,
    };
  }

  addCalls(calls: Call[]) {
    calls.forEach(call => this.addCall(call));
  }

  addCall(call: Call) {
    this.addContractCall(call);
  }

  addContractCall(call: Call) {
    const { abiService } = this.root;
    const iface = new Interface(abiService.getAbi(call.contractType));
    call.params = call.params ? call.params : [];
    const encoded = iface.functions[call.method].encode(call.params);
    this.activeCallsRaw.push([call.address, encoded]);
    this.activeCalls.push(call);
  }

  decodeCall(call: Call, result: any) {
    const { abiService } = this.root;
    const iface = new Interface(abiService.getAbi(call.contractType));
    return iface.functions[call.method].decode(result);
  }

  resetActiveCalls() {
    this.activeCalls = [];
    this.activeCallsRaw = [];
  }
}
