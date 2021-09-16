import RootContext from '../contexts';
import axios from 'axios';
import { ETH_NETWORKS_IDS, DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';
import { INFURA_NETWORK_NAMES } from 'utils';

export default class InfuraService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated() {
    const infuraAPIKey = this.context.configStore.getLocalConfig().infura;
    const networkName = INFURA_NETWORK_NAMES[DEFAULT_ETH_CHAIN_ID];

    if (infuraAPIKey && infuraAPIKey.length > 0) {
      try {
        const auth = await axios({
          method: 'POST',
          url: `https://${networkName}.infura.io/v3/${infuraAPIKey}`,
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
    const infuraAPIKey = this.context.configStore.getLocalConfig().infura;
    if (!infuraAPIKey) return null;

    return ETH_NETWORKS_IDS.reduce((prevUrls, chainId) => {
      const infuraNetworkName = INFURA_NETWORK_NAMES[chainId];

      let infuraUrl = null;
      if (infuraNetworkName) {
        infuraUrl = `https://${infuraNetworkName}.infura.io/v3/${infuraAPIKey}`;
      }

      prevUrls[chainId] = infuraUrl;
      return prevUrls;
    }, {});
  }
}
