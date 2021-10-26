import axios from 'axios';
import IPFS from 'ipfs-core';
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
    const { cid } = await ipfs.add({ content });
    console.debug(`[IPFS] Added content with CID ${cid.string}.`);
    return cid.string;
  }

  async pin(hash: string) {
    const ipfs = await this.getIpfs();
    const cid = new CID(hash);
    console.debug('[IPFS] Pinning IPFS CID', cid);
    return ipfs.pin.add(cid);
  }

  async getContent(hash: string) {
    let content = [];
    try {
      const ipfs = await this.getIpfs();

      for await (const file of ipfs.get(hash)) {
        console.debug('[IPFS] Getting content', file.type, file.path);
        if (file.type != 'file' || !file.content) continue;
        for await (const chunk of file.content) {
          content = content.concat(chunk);
        }
      }
      return content.toString();
    } catch (e) {
      console.error('[IPFS] Error getting content from IPFS', e);
      return 'Error getting content from IPFS';
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
