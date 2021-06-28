import RootStore from '../stores';
import IPFS from 'ipfs-core';
import contentHash from 'content-hash';
import axios from "axios";
const CID = require('cids')

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
  
  async pin(hash: String){
    console.log(new CID(hash))
    return await this.ipfs.pin.add(new CID(hash));
  }
  
  async getContent(hash: String){
    const content = []
    for await (const file of this.ipfs.get(hash)) {
      console.debug("[IPFS FILE]",file.type, file.path);
      if (!file.content) continue;
      for await (const chunk of file.content) {
        content.push(chunk)
      }
    }
    return content.toString("utf8");
  }
}
