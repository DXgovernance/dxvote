import RootContext from '../contexts';
import axios from "axios";
import contentHash from 'content-hash';

export default class PinataService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }
  
  async updatePinList() {
    // const pinList = await this.getPinList();
    const ipfsHashes = this.context.daoStore.getCache().ipfsHashes;
    // const alreadyPinned = pinList.data.rows;
    for (let i = 0; i < ipfsHashes.length; i++) {
      // if (alreadyPinned.indexOf(pinned => alreadyPinned.ipfs_pin_hash === ipfsHashes[i].hash) < 0) {
      //   console.debug('[PINATA] Pinning:', ipfsHashes[i].hash);
      // } else {
      //   console.debug('[PINATA] Alpready pinned:', ipfsHashes[i].hash);
      // }
    }
  }
  
  async isAuthenticated(){
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    try {
      const auth = await axios({
        method: "GET",
        url: "https://api.pinata.cloud/data/testAuthentication",
        headers: { Authorization: `Bearer ${pinataApiKey}` }
      });
      this.auth = auth.status === 200;
    } catch (error) {
      this.auth = false;
    }
  }

  async pin(hashToPin: String){
    console.log('pininng', hashToPin)
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    return axios({
      method: "POST",
      url: "https://api.pinata.cloud/pinning/pinByHash",
      data: {
        hashToPin,
        pinataMetadata: {
          name: `DXdao ${this.context.configStore.getActiveChainName()} DescriptionHash ${contentHash.fromIpfs(hashToPin)}`,
          keyValues: { type: 'proposal' }
        }
      },
      headers: { Authorization: `Bearer ${pinataApiKey}` }
    });
  }
  
  async getPinList(){
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    return axios({
      method: "GET",
      url: `https://api.pinata.cloud/data/pinList?pageLimit=1000&metadata[name]=DXdao ${this.context.configStore.getActiveChainName()}`,
      headers: { Authorization: `Bearer ${pinataApiKey}` }
    });
  }
}
