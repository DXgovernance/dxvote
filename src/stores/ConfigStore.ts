import { action, observable } from 'mobx';
import RootStore from 'stores/Root';
import { getConfig } from '../config/contracts';
import { _ } from 'lodash';
import { CHAIN_NAME_BY_ID, DEFAULT_ETH_CHAIN_ID } from '../provider/connectors';

export default class ConfigStore {
    @observable darkMode: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
      this.rootStore = rootStore;
      this.darkMode = false;
    }
    
    getActiveChainName() {
      const activeWeb3 = this.rootStore.providerStore.getActiveWeb3React();
      return CHAIN_NAME_BY_ID[(activeWeb3 && activeWeb3.chainId) ? activeWeb3.chainId : DEFAULT_ETH_CHAIN_ID];
    }
    
    getApiKeys() {
      return {
        etherscan: localStorage.getItem('dxvote-etherscan'),
        tenderly: localStorage.getItem('dxvote-tenderly')
      }
    }
    
    getApiKey(service) {
      localStorage.getItem('dxvote-'+service);
    }
    
    setApiKey(service, key) {
      localStorage.setItem('dxvote-'+service, key);
    }
    
    @action toggleDarkMode() {
        this.darkMode = !this.darkMode;
    }

    @action setDarkMode(visible: boolean) {
        this.darkMode = visible;
    }
    
    getNetworkConfig() {
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
    getMulticallAddress() {
      return getConfig(this.getActiveChainName()).multicall || "0x0000000000000000000000000000000000000000";
    }
    getSchemeAddress(schemeName) {
      return getConfig(this.getActiveChainName()).schemes[schemeName] || "0x0000000000000000000000000000000000000000";
    }
    
    getSchemeName(schemeAddress) {
      function swap(obj){
        var ret = {};
        for(var key in obj)
          ret[obj[key]] = key;
        return ret;
      }
      const schemeName = swap(getConfig(this.getActiveChainName()).schemes)[schemeAddress];
      return (schemeName.charAt(0).toUpperCase() + schemeName.slice(1)).replace(/([A-Z])/g, ' $1').trim()

    }
}
