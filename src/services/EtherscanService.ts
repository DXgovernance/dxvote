import RootStore from '../stores';
import axios from "axios";

export default class EtherscanService {
  rootStore: RootStore;
  auth: Boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  
  async isAuthenticated(){
    const etherscanAPIKey = this.rootStore.configStore.getLocalConfig().etherscan;
    const { account } = this.rootStore.providerStore.getActiveWeb3React();
    const auth = await axios({
      method: "GET",
      url: `https://api.etherscan.io/api?module=account&action=balance&address=${account}&tag=latest&apikey=${etherscanAPIKey}`,
    });
    this.auth = auth.data.status == 1;
  }
  
  async getContractABI(address: string){
    const etherscanAPIKey = this.rootStore.configStore.getLocalConfig().etherscan;
    return axios({
      method: "GET",
      url: `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanAPIKey}`,
    });
  }
  
  async getContractSource(address: string){
    const etherscanAPIKey = this.rootStore.configStore.getLocalConfig().etherscan;
    return axios({
      method: "GET",
      url: `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${etherscanAPIKey}`,
    });
  }
}
