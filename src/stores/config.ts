import RootStore from 'stores/Root';
import { getConfig } from '../config/contracts';
import { CHAIN_NAME_BY_ID, DEFAULT_ETH_CHAIN_ID } from '../provider/connectors';

export default class ConfigStore {
    rootStore: RootStore;

    constructor(rootStore) {
      this.rootStore = rootStore;
    }
    
    getActiveChainName() {
      const activeWeb3 = this.rootStore.providerStore.getActiveWeb3React();
      return CHAIN_NAME_BY_ID[(activeWeb3 && activeWeb3.chainId) ? activeWeb3.chainId : DEFAULT_ETH_CHAIN_ID];
    }
    
    getNetworkConfig() {
      console.log(this.getActiveChainName(), DEFAULT_ETH_CHAIN_ID)
      return getConfig(this.getActiveChainName());
    }
    getAvatarAddress() {
      return getConfig(this.getActiveChainName()).avatar || "0x0000000000000000000000000000000000000000";
    }
    getControllerAddress() {
      return getConfig(this.getActiveChainName()).controller || "0x0000000000000000000000000000000000000000";
    }
    getReputationAddress() {
      return getConfig(this.getActiveChainName()).reputation || "0x0000000000000000000000000000000000000000";
    }
    getVotingMachineAddress() {
      return getConfig(this.getActiveChainName()).votingMachine || "0x0000000000000000000000000000000000000000";
    }
    getVotingMachineTokenAddress() {
      return getConfig(this.getActiveChainName()).votingMachineToken || "0x0000000000000000000000000000000000000000";
    }
    getMasterWalletSchemeAddress() {
      return getConfig(this.getActiveChainName()).masterWalletScheme || "0x0000000000000000000000000000000000000000";
    }
    getQuickWalletSchemeAddress() {
      return getConfig(this.getActiveChainName()).quickWalletScheme || "0x0000000000000000000000000000000000000000";
    }
    getMulticallAddress() {
      return getConfig(this.getActiveChainName()).multicall || "0x0000000000000000000000000000000000000000";
    }
}
