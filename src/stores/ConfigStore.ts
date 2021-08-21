import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';
import { getTokensOfNetwork, getTokenData, getNetworkConfig, getRecommendedCalls, getProposalTemplates } from '../config';
import { _ } from 'lodash';
import { NETWORK_NAMES } from '../provider/connectors';

export default class ConfigStore {
    darkMode: boolean;
    context: RootContext;

    constructor(context) {
      this.context = context;
      this.darkMode = false;
      makeObservable(this, {
          darkMode: observable,
          toggleDarkMode: action
        }
      );
    }
    
    getActiveChainName() {
      const activeWeb3 = this.context.providerStore.getActiveWeb3React();
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
    
    getCacheIPFSHash(networkName) {
      const ipfsHashesOfNetworkCaches = {
        "mainnet": "QmZVaa3n4gZqrqMX6233FeD3TQC95QwUWwn6p72KNySxeN",
        "xdai": "QmTqG4fj72npVGmjodNdJ6ZSUMjaD4SZNJDNCFZF1vutwV",
        "rinkeby": "QmbstfTpn2aBsxGQqkA9Y1RWPbTjB829ePWhFQsZwBv3iJ",
        "arbitrumTestnet": "QmW8GarhVMNSNS6PNAvnsRu39UbKXRwEWQtU4BueYsQiwz",
        "localhost": "QmQFGjpUk52fYWNm3nWgELTjqter1dwnAaXggAhggnc26f",
        "arbitrum": "QmccjtNMVNqK7WGi34Lc22WpKk85N27eVm6pBJ1wPchWYW"
      };
      
      return ipfsHashesOfNetworkCaches[networkName];
    }
    
    getRecommendedCalls() {
      return getRecommendedCalls(this.getActiveChainName());
    }
    
    getTokensOfNetwork() {
      return getTokensOfNetwork(this.getActiveChainName());
    }
    
    getTokenOfNetwork(address) {
      return getTokenData(this.getActiveChainName(), address);
    }
    
    getProposalTemplates() {
      return getProposalTemplates(this.getActiveChainName());
    }
}
