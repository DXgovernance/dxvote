import RootStore from '../stores/Root';
import IPFS from 'ipfs-core';
import contentHash from 'content-hash';
import * as request from "request-promise-native";

export default class IPFSService {
  rootStore: RootStore;
  calls: {[hash:string]: {
    time: Number,
    content: String,
    fetched: Boolean
  }} = {}

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  async add(
    content: String
  ){
    const ipfs = await IPFS.create()
    const { cid } = await ipfs.add({content})
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
