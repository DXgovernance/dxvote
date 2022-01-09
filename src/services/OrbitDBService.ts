import { sleep } from '../utils';
import RootContext from '../contexts';
import OrbitDB from 'orbit-db';

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

  async addLog(topic: string, message: string) {
    const orbitDB = await this.getOrbitDB();
    const eventlog = await orbitDB.eventlog(topic, { write: ['*'] });
    eventlog.events.on(
      'load.progress',
      (address, hash, entry, progress, total) => {
        console.log(address, progress);
      }
    );
    eventlog.events.on(
      'replicate.progress',
      (address, hash, entry, progress, have) => {
        console.log('replicate', progress);
      }
    );
    eventlog.events.on('ready', () => console.log('db ready'));
    await eventlog.load();
    const logAdded = await eventlog.add({ message: message });
    console.log(
      `[OrbitDB] Added log event with topic ${topic} and message ${message} on event ${logAdded}`
    );
    return;
  }

  async getLogs(topic: string) {
    const orbitDB = await this.getOrbitDB();
    const eventlog = await orbitDB.eventlog(topic, { write: ['*'] });
    await eventlog.load();
    const logs = await eventlog.iterator({ limit: -1 }).collect();
    console.debug(`[OrbitDB] Logs fetched with topic ${topic}`, logs);
    return logs.map(log => log.payload.value.message);
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
