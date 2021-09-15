import RootContext from '../contexts';
import axios from 'axios';

export default class InfuraService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async isAuthenticated() {
    const infuraAPIKey = this.context.configStore.getLocalConfig().infura;
    const networkName = this.getInfuraNetworkName();

    if (infuraAPIKey && infuraAPIKey.length > 0) {
      const auth = await axios({
        method: 'POST',
        url: `https://${networkName}.infura.io/v3/${infuraAPIKey}`,
        data: { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 },
      });
      this.auth = auth.status === 200;
    }
  }

  getInfuraNetworkName() {
    const activeChainName = this.context.configStore.getActiveChainName();
    switch (activeChainName) {
      case 'arbitrum':
        return 'arbitrum-mainnet';
      case 'arbitrumTestnet':
        return 'arbitrum-rinkeby';
      default:
        return activeChainName;
    }
  }
}
