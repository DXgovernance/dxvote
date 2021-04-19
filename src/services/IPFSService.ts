import RootStore from '../stores';
import IPFS from 'ipfs-core';
import contentHash from 'content-hash';
import * as request from "request-promise-native";

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

  async add(
    content: String
  ){
    const { cid } = await this.ipfs.add({content})
    return contentHash.fromIpfs(cid);
  }

  call(
    hash: String
  ){
    if (!this.calls[contentHash.decode(hash)]) {
      this.calls[contentHash.decode(hash)] = {
        time: new Date().getTime() / 1000,
        content: "",
        fetched: false
      };
      request.get({uri: `https://ipfs.io/ipfs/${contentHash.decode(hash)}`}).then((content) => {
        this.calls[contentHash.decode(hash)] = {
          time: new Date().getTime() / 1000,
          content: content,
          fetched: true
        };
      })
    }
  }
  
  get(
    hash: String
  ){
    return !this.calls[contentHash.decode(hash)] ? {
      time: 0,
      content: "",
      fetched: false,
    } : this.calls[contentHash.decode(hash)];
  }  
}
