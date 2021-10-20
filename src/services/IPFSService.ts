import RootContext from '../contexts';
import axios from 'axios';
import IPFS from 'ipfs-core';

import { sleep } from '../utils';

const CID = require('cids');

export default class IPFSService {
  context: RootContext;
  calls: {
    [hash: string]: {
      time: Number;
      content: String;
      fetched: Boolean;
    };
  } = {};
  ipfs: any = null;
  started: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }

  async start() {
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
    const { cid } = await this.ipfs.add({ content });
    console.log(cid.string);
    return cid.string;
  }

  async pin(hash: String) {
    console.log(new CID(hash));
    return await this.ipfs.pin.add(new CID(hash));
  }

  async getContent(hash: String) {
    let content = [];
    try {
      for await (const file of this.ipfs.get(hash)) {
        console.debug('[IPFS FILE]', file.type, file.path);
        if (!file.content) continue;
        for await (const chunk of file.content) {
          content = content.concat(chunk);
        }
      }
      return content.toString();
    } catch (e) {
      console.error(e);
      return 'error fetching IFPS';
    }
  }

  async getContentFromIPFS(hash: string) {
    return (
      await axios({
        method: 'GET',
        url: 'https://gateway.pinata.cloud/ipfs/' + hash,
      })
    ).data;
  }

  async uploadProposalMetadata(
    title: string,
    description: string,
    tags: string[],
    pinataService
  ) {
    const bodyTextToUpload = JSON.stringify({
      description,
      title,
      tags: [...tags, 'dxvote'],
      url: '',
    });

    const hash = await this.add(bodyTextToUpload);
    localStorage.setItem('dxvote-newProposal-hash', hash);

    if (pinataService.auth) {
      const pinataPin = await this.pin(hash);
      console.debug('[PINATA PIN]', pinataPin.data);
    }
    const ipfsPin = await this.pin(hash);
    console.debug('[IPFS PIN]', ipfsPin);

    let uploaded = false;
    while (!uploaded) {
      const ipfsContent = await this.getContent(hash);
      console.debug('[IPFS CONTENT]', ipfsContent);
      if (ipfsContent === bodyTextToUpload) uploaded = true;
      await sleep(1000);
    }
    return hash;
  }
}
