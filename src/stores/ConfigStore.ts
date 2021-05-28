import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';
import { getTokens, getNetworkConfig } from '../config';
import { _ } from 'lodash';
import { NETWORK_NAMES } from '../provider/connectors';

export default class ConfigStore {
    darkMode: boolean;
    rootStore: RootStore;

    constructor(rootStore) {
      this.rootStore = rootStore;
      this.darkMode = false;
      makeObservable(this, {
          darkMode: observable,
          toggleDarkMode: action
        }
      );
    }
    
    getActiveChainName() {
      const activeWeb3 = this.rootStore.providerStore.getActiveWeb3React();
      return activeWeb3 ? NETWORK_NAMES[activeWeb3.chainId] : 'none';
    }
    
    getApiKeys() {
      return {
        etherscan: localStorage.getItem('dxvote-etherscan'),
        pinata: localStorage.getItem('dxvote-pinata')
      }
    }
    
    getApiKey(service) {
      localStorage.getItem('dxvote-'+service);
    }
    
    setApiKey(service, key) {
      localStorage.setItem('dxvote-'+service, key);
    }
    
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
    }

    @action setDarkMode(visible: boolean) {
        this.darkMode = visible;
    }
    
    getNetworkConfig() {
      return getNetworkConfig(this.getActiveChainName());
    }
}
