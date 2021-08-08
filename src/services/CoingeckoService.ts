import RootContext from '../contexts';
import axios from "axios";
import web3 from "web3";
import { getTokensToFetchPrice } from '../config';

export default class CoingeckoService {
  context: RootContext;
  prices: any = {};

  constructor(context: RootContext) {
    this.context = context;
  }
  
  async loadPrices(){
    const tokens = getTokensToFetchPrice(this.context.configStore.getActiveChainName());
    const networkName = this.context.configStore.getActiveChainName() == 'mainnet' ? 'ethereum'
      : this.context.configStore.getActiveChainName() == 'xdai' ? 'xdai'
      : '';
    
    if (networkName == 'ethereum' || networkName == 'xdai') {
      let tokenAddresses = "";
      tokens.map((token, i) => {
        if (i == tokens.length - 1)
          tokenAddresses += token.address;
        else
        tokenAddresses += token.address + "%2C";
      })
      console.log(`https://api.coingecko.com/api/v3/simple/token_price/${networkName}?contract_addresses=${tokenAddresses}&vs_currencies=usd`)
      const pricesResponse = await Promise.all([
        axios({
          method: "GET",
          url: `https://api.coingecko.com/api/v3/simple/token_price/${networkName}?contract_addresses=${tokenAddresses}&vs_currencies=usd`
        }),
        axios({
          method: "GET",
          url: `https://api.coingecko.com/api/v3/simple/price?ids=${networkName}&vs_currencies=usd`
        })
      ]);
      
      if ((pricesResponse[0].status == 200) && (pricesResponse[1].status == 200)){
        this.prices = pricesResponse[0].data;
        
        Object.keys(this.prices).map((tokenAddress) => {
          this.prices[web3.utils.toChecksumAddress(tokenAddress)] = this.prices[tokenAddress];
          delete this.prices[tokenAddress];
        });
        
        this.prices["0x0000000000000000000000000000000000000000"] = pricesResponse[1].data[networkName];
      }
    }
    return;
  }
  
  getPrices() {
    return this.prices;
  }
}
