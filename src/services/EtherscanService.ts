import RootContext from '../contexts';
import axios from "axios";

export default class EtherscanService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }
  
  async isAuthenticated(){
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    const { account } = this.context.providerStore.getActiveWeb3React();
    if (etherscanAPIKey && etherscanAPIKey.length > 0) {
      const auth = await axios({
        method: "GET",
        url: `https://api.etherscan.io/api?module=account&action=balance&address=${account}&tag=latest&apikey=${etherscanAPIKey}`,
      });
      this.auth = auth.data.status == 1;
    }
  }
  
  async getContractABI(address: string){
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    return axios({
      method: "GET",
      url: `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanAPIKey}`,
    });
  }
  
  async getContractSource(address: string){
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    return axios({
      method: "GET",
      url: `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${etherscanAPIKey}`,
    });
  }
}
