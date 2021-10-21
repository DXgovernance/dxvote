import RootContext from '../contexts';
import axios from 'axios';
import { appendEthAPIKey, NETWORK_APIS } from 'utils';

export default class EtherscanService {
  context: RootContext;
  auth: Boolean = false;
  etherscanAPIKey: string;

  constructor(context: RootContext) {
    this.context = context;
    this.etherscanAPIKey = this.context.configStore.getLocalConfig().etherscan;
  }

  async isAuthenticated(networkName: string) {
    const { account } = this.context.providerStore.getActiveWeb3React();
    const params = new URLSearchParams({
      module: 'account',
      action: 'balance',
      address: account,
      apikey: appendEthAPIKey(networkName, this.etherscanAPIKey),
      tag: 'latest',
    });
    const getContractURL = new URL(
      '/api?' + params.toString(),
      NETWORK_APIS[networkName]
    );

    if (this.etherscanAPIKey && this.etherscanAPIKey.length > 0) {
      const auth = await axios({
        method: 'GET',
        url: getContractURL.toString(),
      });
      this.auth = auth.data.status === 1;
    }
  }

  async getContractABI(address: string, networkName: string) {
    const params = new URLSearchParams({
      module: 'contract',
      action: 'getabi',
      address: address,
      apikey: appendEthAPIKey(networkName, this.etherscanAPIKey),
    });
    const getContractURL = new URL(
      '/api?' + params.toString(),
      NETWORK_APIS[networkName]
    );
    return axios({
      method: 'GET',
      url: getContractURL.toString(),
    });
  }

  async getContractSource(address: string, networkName: string) {
    const params = new URLSearchParams({
      module: 'contract',
      action: 'getsourcecode',
      address: address,
      apikey: appendEthAPIKey(networkName, this.etherscanAPIKey),
    });

    const getContractURL = new URL(
      '/api?' + params.toString(),
      NETWORK_APIS[networkName]
    );

    return axios({
      method: 'GET',
      url: getContractURL.toString(),
    });
  }
}
