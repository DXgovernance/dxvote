import RootContext from '../contexts';
import axios from 'axios';
import { ETH_NETWORKS_IDS } from 'provider/connectors';

export default class CustomRpcService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated() {
    const customRpcUrl = this.context.configStore.getLocalConfig().customRpcUrl;

    if (customRpcUrl && customRpcUrl.length > 0) {
      try {
        const auth = await axios({
          method: 'POST',
          url: customRpcUrl,
          data: {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          },
        });
        this.auth = auth.status === 200;
      } catch (e) {
        this.auth = false;
      }
    } else {
      this.auth = false;
    }
  }

  getRpcUrls() {
    const customRpcUrl = this.context.configStore.getLocalConfig().customRpcUrl;
    if (!customRpcUrl) return null;

    return ETH_NETWORKS_IDS.reduce((prevUrls, chainId) => {
      prevUrls[chainId] = customRpcUrl;
      return prevUrls;
    }, {});
  }
}
