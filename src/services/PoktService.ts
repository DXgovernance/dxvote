import RootContext from '../contexts';
import axios from 'axios';
import { ETH_NETWORKS_IDS, DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';
import { DEFAULT_RPC_URLS, POKT_NETWORK_URLS } from 'utils';

export default class poktService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated() {
    const poktAPIKey = this.context.configStore.getLocalConfig().pokt;

    if (poktAPIKey && poktAPIKey.length > 0) {
      try {
        const auth = await axios({
          method: 'POST',
          url: POKT_NETWORK_URLS[DEFAULT_ETH_CHAIN_ID],
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
    const poktAPIKey = this.context.configStore.getLocalConfig().pokt;
    if (!poktAPIKey) return null;

    return ETH_NETWORKS_IDS.reduce((prevUrls, chainId) => {
      const poktNetworkName = POKT_NETWORK_URLS[chainId];

      let poktUrl = null;
      if (poktNetworkName) {
        poktUrl = poktNetworkName;
      } else {
        poktUrl = DEFAULT_RPC_URLS[chainId];
      }

      prevUrls[chainId] = poktUrl;
      return prevUrls;
    }, {});
  }
}
