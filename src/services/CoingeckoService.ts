import RootStore from '../stores';
import axios from "axios";
import web3 from "web3";

export default class CoingeckoService {
  rootStore: RootStore;
  prices: any = {};

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  
  async loadPrices(){
    const tokens = this.rootStore.configStore.getNetworkConfig().tokens;
    const networkName = this.rootStore.configStore.getActiveChainName() == 'mainnet' ? 'ethereum'
      : this.rootStore.configStore.getActiveChainName() == 'xdai' ? 'xdai'
      : '';
    
    if (networkName == 'ethereum' || networkName == 'xdai') {
      let tokenAddresses = "";
      Object.keys(tokens).map((tokenAddress, i) => {
        if (i == Object.keys(tokens).length - 1)
          tokenAddresses += tokenAddress;
        else
        tokenAddresses += tokenAddress + "%2C";
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
