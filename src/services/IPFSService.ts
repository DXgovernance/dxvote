import axios from 'axios';
import * as IPFS from 'ipfs-core';
import CID from 'cids';
import { sleep } from '../utils';
import RootContext from '../contexts';
import any from 'promise.any';

export default class IPFSService {
  private static SLEEP_MS = 1000;

  context: RootContext;
  starting: Boolean = false;
  private ipfs: IPFS.IPFS = null;

  constructor(context: RootContext) {
    this.context = context;
  }

  async getIpfs(): Promise<IPFS.IPFS> {
    if (this.starting) {
      console.debug(
        `[IPFS] IPFS is still starting. Sleeping for ${IPFSService.SLEEP_MS}ms.`
      );
      await sleep(IPFSService.SLEEP_MS);
      return this.getIpfs();
    }

    if (!this.ipfs) {
      console.debug('[IPFS] Initializing IPFS instance...');
      await this.start();
    } else {
      console.debug('[IPFS] Reusing existing IPFS instance.');
    }

    return this.ipfs;
  }

  async add(content: string) {
    const ipfs = await this.getIpfs();
    const { cid } = await ipfs.add(content);
    console.debug(`[IPFS] Added content with CID ${cid.toString()}.`);
    return cid.toString();
  }

  async pin(hash: string) {
    const ipfs = await this.getIpfs();
    const cid = new CID(hash);
    console.debug('[IPFS] Pinning IPFS CID', cid);
    return ipfs.pin.add(cid.toString());
  }

  async getContentFromIPFS(hash: string) {
    const response = await any([
      axios.request({
        url: 'https://ipfs.io/ipfs/' + hash,
        method: 'GET',
      }),
      axios.request({
        url: 'https://gateway.ipfs.io/ipfs/' + hash,
        method: 'GET',
      }),
      axios.request({
        url: 'https://cloudflare-ipfs.com/ipfs/' + hash,
        method: 'GET',
      }),
      axios.request({
        url: 'https://gateway.pinata.cloud/ipfs/' + hash,
        method: 'GET',
      }),
      axios.request({
        url: 'https://dweb.link/ipfs/' + hash,
        method: 'GET',
      }),
      axios.request({
        url: 'https://infura-ipfs.io/ipfs/' + hash,
        method: 'GET',
      }),
    ]);
    return response.data;
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
      console.debug('[PINATA PIN]', pinataPin.toString());
    }
    const ipfsPin = await this.pin(hash);
    console.debug('[IPFS PIN]', ipfsPin);

    let uploaded = false;
    while (!uploaded) {
      const ipfsContent = await this.getContentFromIPFS(hash);
      console.debug('[IPFS CONTENT]', ipfsContent);
      if (ipfsContent === bodyTextToUpload) uploaded = true;
      await sleep(1000);
    }
    return hash;
  }

  private async start() {
    if (this.starting) return;

    this.starting = true;
    try {
      this.ipfs = await IPFS.create();
      console.debug('[IPFS] Initialized IPFS instance.');
    } catch (e) {
      console.error('[IPFS] Error initializing IPFS instance.', e);
    } finally {
      this.starting = false;
    }
  }
}
