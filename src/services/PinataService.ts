import RootStore from '../stores';
import axios from "axios";

export default class PinataService {
  rootStore: RootStore;
  auth: Boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  
  async isAuthenticated(){
    const pinataApiKey = this.rootStore.configStore.getApiKeys().pinata;
    try {
      const auth = await axios({
        method: "GET",
        url: "https://api.pinata.cloud/data/testAuthentication",
        headers: { Authorization: `Bearer ${pinataApiKey}` }
      });
      this.auth = auth.status == 200;
    } catch (error) {
      this.auth = false;
    }
  }

  async pin(hash: String){
    const pinataApiKey = this.rootStore.configStore.getApiKeys().pinata;
    return axios({
      method: "POST",
      url: "https://api.pinata.cloud/pinning/pinByHash",
      data: { hashToPin: hash },
      headers: { Authorization: `Bearer ${pinataApiKey}` }
    });
  }
  
  async getPinList(){
    const pinataApiKey = this.rootStore.configStore.getApiKeys().pinata;
    return axios({
      method: "GET",
      url: "https://api.pinata.cloud/data/pinList",
      headers: { Authorization: `Bearer ${pinataApiKey}` }
    });
  }
}
