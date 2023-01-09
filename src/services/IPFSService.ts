import axios from 'axios';
import * as IPFS from 'ipfs';
import CID from 'cids';
import { sleep } from '../utils';
import RootContext from '../contexts';

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

  async getContentFromIPFS(hash: string, timeout = 60000) {
    const gatewayURLBaseList = [
      'https://dxgov.mypinata.cloud/ipfs/',
      'https://davi.mypinata.cloud/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://gateway.ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/',
      'https://infura-ipfs.io/ipfs/',
    ];

    const response = await Promise.any(
      gatewayURLBaseList.map(gatewayURLBase =>
        axios.get(gatewayURLBase + hash, {
          timeout,
        })
      )
    );
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
      const pinataPin = await pinataService.pin(hash, {
        description,
        title,
        tags: [...tags, 'dxvote'],
        url: '',
      });
      console.debug('[PINATA PIN]', pinataPin.toString());
    } else {
      console.debug('[PINATA PIN] NOT AUTHENTICATED');
    }
    const ipfsPin = await this.pin(hash);
    console.debug('[IPFS PIN]', ipfsPin);

    let uploaded = false;
    while (!uploaded) {
      await sleep(1000);
      const ipfsContent = await this.getContentFromIPFS(hash, 5000);
      console.debug('[IPFS CONTENT]', ipfsContent);
      if (JSON.stringify(ipfsContent) === bodyTextToUpload) uploaded = true;
    }
    return hash;
  }

  async upload(content: string) {
    const hash = await this.add(content);

    if (this.context.pinataService.auth) {
      const pinataPin = await this.context.pinataService.pin(hash);
      console.debug('[PINATA PIN]', pinataPin.toString());
    }
    const ipfsPin = await this.pin(hash);
    console.debug('[IPFS PIN]', ipfsPin);

    let uploaded = false;
    while (!uploaded) {
      await sleep(1000);
      const ipfsContent = await this.getContentFromIPFS(hash, 5000);
      console.debug('[IPFS CONTENT]', ipfsContent);
      if (content === content) uploaded = true;
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
