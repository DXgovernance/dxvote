import RootStore from '../stores';
import IPFS from 'ipfs-core';
import contentHash from 'content-hash';
import axios from "axios";

export default class IPFSService {
  rootStore: RootStore;
  calls: {[hash:string]: {
    time: Number,
    content: String,
    fetched: Boolean
  }} = {};
  ipfs: any = null;
  started: Boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
  
  async start(){
    if (!this.ipfs && !this.started) {
      this.started = true;
      this.ipfs = await IPFS.create();
    }
  }

  async add(content: String): Promise<string>{
    const cid = (await this.ipfs.add({content})).cid;
    return cid.string;
  }
  
  async pin(cid: String){
    await this.ipfs.pin.add(cid);
  }
  
  async get(hash: String){
    return axios.get(`https://gateway.pinata.cloud/ipfs/${contentHash.decode(hash)}`);
  }
}
