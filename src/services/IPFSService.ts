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
      try {
        this.ipfs = await IPFS.create();
      } catch (error) {
        console.error('[IPFS]', error);
      }
    }
  }

  async add(content: String) {
    const { cid } = await this.ipfs.add({content});
    console.log(cid.string)
    return cid.string;
  }
  
  async pin(cid: String){
    await this.ipfs.pin.add(cid);
  }
  
  async get(hash: String){
    return axios.get(`https://gateway.pinata.cloud/ipfs/${contentHash.decode(hash)}`);
  }
}
