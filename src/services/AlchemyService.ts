import RootContext from '../contexts';
import axios from 'axios';
import { ETH_NETWORKS_IDS, DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';
import { ALCHEMY_NETWORK_URLS } from 'utils';

export default class AlchemyService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated() {
    const alchemyAPIKey = this.context.configStore.getLocalConfig().alchemy;
    const networkUrl = ALCHEMY_NETWORK_URLS[DEFAULT_ETH_CHAIN_ID];

    if (alchemyAPIKey && alchemyAPIKey.length > 0) {
      try {
        const auth = await axios({
          method: 'POST',
          url: `https://${networkUrl}/v2/${alchemyAPIKey}`,
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
    }
  }

  getRpcUrls() {
    const alchemyAPIKey = this.context.configStore.getLocalConfig().alchemy;
    if (!alchemyAPIKey) return null;

    return ETH_NETWORKS_IDS.reduce((prevUrls, chainId) => {
      const networkUrl = ALCHEMY_NETWORK_URLS[chainId];

      let alchemyUrl = null;
      if (networkUrl) {
        alchemyUrl = `https://${networkUrl}/v2/${alchemyAPIKey}`;
      }

      prevUrls[chainId] = alchemyUrl;
      return prevUrls;
    }, {});
  }
}
