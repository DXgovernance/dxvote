import RootContext from '../contexts';
import axios from 'axios';
import { etherumCheck, NETWORK_APIS } from 'utils';

export default class EtherscanService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated(networkName: string) {
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    const { account } = this.context.providerStore.getActiveWeb3React();
    if (etherscanAPIKey && etherscanAPIKey.length > 0) {
      const auth = await axios({
        method: 'GET',
        url: `${
          NETWORK_APIS[networkName]
        }/api?module=account&action=balance&address=${account}&tag=latest
        
      ${etherumCheck(networkName, etherscanAPIKey)}
        
        `,
      });
      this.auth = auth.data.status === 1;
    }
  }

  async getContractABI(address: string, networkName: string) {
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    return axios({
      method: 'GET',
      url: `${
        NETWORK_APIS[networkName]
      }/api?module=contract&action=getabi&address=${address}
      ${etherumCheck(networkName, etherscanAPIKey)}
      `,
    });
  }

  async getContractSource(address: string, networkName: string) {
    const etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
    return axios({
      method: 'GET',
      url: `${
        NETWORK_APIS[networkName]
      }/api?module=contract&action=getsourcecode&address=${address}
      
      ${etherumCheck(networkName, etherscanAPIKey)}
      
      }`,
    });
  }
}
