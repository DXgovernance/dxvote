import { action, makeObservable } from 'mobx';
import PromiEvent from 'promievent';
import RootContext from '../contexts';
import { encodeDxdVestingRelease } from '../utils/encodingCalls';

export default class DaoService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;

    makeObservable(this, {
      redeemVestedDxd: action,
    });
  }

  redeemVestedDxd(contractAddress: string): PromiEvent<any> {
    const { providerStore, configStore } = this.context;
    const { library } = providerStore.getActiveWeb3React();
    const contracts = configStore.getNetworkContracts();

    return providerStore.sendRawTransaction(
      providerStore.getActiveWeb3React(),
      contractAddress,
      encodeDxdVestingRelease(library, contracts.votingMachines.dxd.token),
      '0'
    );
  }
}
