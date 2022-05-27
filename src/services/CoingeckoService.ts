import RootContext from '../contexts';
import axios from 'axios';
import web3 from 'web3';

export default class CoingeckoService {
  context: RootContext;
  prices: any = {};

  constructor(context: RootContext) {
    this.context = context;
  }

  async loadPrices() {
    const tokens = this.context.configStore.getTokensToFetchPrice();
    const networkName =
      this.context.configStore.getActiveChainName() === 'mainnet'
        ? 'ethereum'
        : this.context.configStore.getActiveChainName() === 'xdai'
        ? 'xdai'
        : '';

    if (networkName === 'ethereum' || networkName === 'xdai') {
      let tokenAddresses = '';
      tokens.forEach((token, i) => {
        if (i === tokens.length - 1) tokenAddresses += token.address;
        else tokenAddresses += token.address + '%2C';
      });
      const pricesResponse = await Promise.all([
        axios({
          method: 'GET',
          url: `https://api.coingecko.com/api/v3/simple/token_price/${networkName}?contract_addresses=${tokenAddresses}&vs_currencies=usd`,
        }),
        axios({
          method: 'GET',
          url: `https://api.coingecko.com/api/v3/simple/price?ids=${networkName}&vs_currencies=usd`,
        }),
      ]);

      if (
        pricesResponse[0].status === 200 &&
        pricesResponse[1].status === 200
      ) {
        this.prices = pricesResponse[0].data;

        Object.keys(this.prices).forEach(tokenAddress => {
          this.prices[web3.utils.toChecksumAddress(tokenAddress)] =
            this.prices[tokenAddress];
          delete this.prices[tokenAddress];
        });

        this.prices['0x0000000000000000000000000000000000000000'] =
          pricesResponse[1].data[networkName];
      }
    }
    return;
  }

  getPrices() {
    return this.prices;
  }

  async getCoinData(token: String) {
    return (
      await axios({
        method: 'GET',
        url: `https://api.coingecko.com/api/v3/coins/${token}`,
      })
    ).data;
  }
}
