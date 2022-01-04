import * as OrbitDB from 'orbit-db';
import { sleep } from '../utils';
import RootContext from '../contexts';

export default class OrbitDBService {
  private static SLEEP_MS = 1000;

  context: RootContext;
  starting: Boolean = false;
  private orbitDB: OrbitDB = null;

  constructor(context: RootContext) {
    this.context = context;
  }

  async getOrbitDB(): Promise<OrbitDB> {
    if (this.starting) {
      console.debug(
        `[OrbitDb] OrbitDb is still starting. Sleeping for ${OrbitDBService.SLEEP_MS}ms.`
      );
      await sleep(OrbitDBService.SLEEP_MS);
      return this.getOrbitDB();
    }

    if (!this.orbitDB) {
      console.debug('[OrbitDb] Initializing OrbitDb instance...');
      await this.start();
    } else {
      console.debug('[OrbitDb] Reusing existing OrbitDb instance.');
    }

    return this.orbitDB;
  }

  async addFeed(feedId: string, message: string) {
    const orbitDB = await this.getOrbitDB();
    const feed = await orbitDB.feed(feedId);
    await feed.add({ message: message });
    const posts = feed.iterator().collect();
    posts.forEach(post => {
      let data = post.payload.value;
      console.log(data);
    });
    console.log(
      `[OrbitDB] Added feed with id ${feedId} and message ${message}`
    );
    return;
  }

  async getFeed(feedId: string) {
    const orbitDB = await this.getOrbitDB();
    const feed = await orbitDB.feed(feedId);
    console.log('getting feed', feedId);
    const posts = feed.iterator().collect();
    console.log(posts);
    posts.forEach(post => console.log(`[OrbitDB] ${feedId} feed: ${post} \n`));
  }

  private async start() {
    if (this.starting) return;
    const ipfs = await this.context.ipfsService.getIpfs();
    this.starting = true;
    try {
      this.orbitDB = await OrbitDB.createInstance(ipfs);
      console.debug('[OrbitDB] Initialized OrbitDB instance.');
    } catch (e) {
      console.error('[OrbitDB] Error initializing OrbitDB instance.', e);
    } finally {
      this.starting = false;
    }
  }
}
