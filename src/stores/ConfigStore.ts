import { makeObservable, observable, action } from 'mobx';
import RootStore from 'stores';
import { getTokensOfNetwork, getNetworkConfig, getRecommendedCalls } from '../config';
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
    
    getLocalConfig() {
      if (localStorage.getItem('dxvote-config'))
        return JSON.parse(localStorage.getItem('dxvote-config'));
      else return {
        etherscan: '',
        pinata: '',
        pinOnStart: false
      };
    }
    
    setLocalConfig(config) {
      localStorage.setItem('dxvote-config', JSON.stringify(config));
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
    
    getRecommendedCalls() {
      return getRecommendedCalls(this.getActiveChainName());
    }
    
    getTokensOfNetwork() {
      return getTokensOfNetwork(this.getActiveChainName());
    }
}
