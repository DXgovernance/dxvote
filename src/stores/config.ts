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
      return getConfig(this.getActiveChainName()).avatar;
    }
    getControllerAddress() {
      return getConfig(this.getActiveChainName()).controller;
    }
    getReputationAddress() {
      return getConfig(this.getActiveChainName()).reputation;
    }
    getVotingMachineAddress() {
      return getConfig(this.getActiveChainName()).votingMachine;
    }
    getVotingMachineTokenAddress() {
      return getConfig(this.getActiveChainName()).votingMachineToken;
    }
    getMasterWalletSchemeAddress() {
      return getConfig(this.getActiveChainName()).masterWalletScheme;
    }
    getQuickWalletSchemeAddress() {
      return getConfig(this.getActiveChainName()).quickWalletScheme;
    }
    getMulticallAddress() {
      return getConfig(this.getActiveChainName()).multicall;
    }
}
