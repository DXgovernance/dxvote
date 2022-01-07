import { hashVote, sleep, toEthSignedMessageHash } from '../utils';
import RootContext from '../contexts';
import OrbitDB from 'orbit-db';
import { utils } from 'ethers';

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

  async broadcastVote(
    votingMachineAddress: string,
    proposalId: string,
    decision: string,
    repAmount: string
  ) {
    const { account } = this.context.providerStore.getActiveWeb3React();
  
    // Step 1: The Vote is hashed, and the hash is signed.
    // keccak256(abi.encodePacked( votingMachine, proposalId, voter, voteDecision, amount ));
    const hashedVote = hashVote(
      votingMachineAddress,
      proposalId,
      account,
      decision,
      repAmount
    );
    console.log('Hashed vote:', hashedVote);

    let voteSignature = await this.context.providerStore.sign(
      this.context.providerStore.getActiveWeb3React(),
      toEthSignedMessageHash(hashedVote)
    );

    console.log('Vote signature object:', voteSignature);
    await this.addFeed(
      utils.id(`dxvote:${proposalId}`),
      `signedVote:${votingMachineAddress}:${proposalId}:${account}:${decision}:${repAmount}:${voteSignature.result}`
    );
  };

  async addFeed(feedId: string, message: string) {
    const orbitDB = await this.getOrbitDB();
    const feed = await orbitDB.feed(feedId, { write: ['*'] });
    feed.events.on('load.progress', (address, hash, entry, progress, total) => { console.log(address, progress) });
    feed.events.on('replicate.progress', (address, hash, entry, progress, have) => { console.log('replicate', progress) });
    feed.events.on('ready', () => console.log('db ready'));
    await feed.load();
    const feedAdded = await feed.add({ message: message });
    console.log(`[OrbitDB] Added feed with id ${feedId} and message ${message} on feed ${feedAdded}` );
    return;
  }

  async getFeed(feedId: string) {
    const orbitDB = await this.getOrbitDB();
    const feed = await orbitDB.feed(feedId, { write: ['*'] });
    await feed.load();
    const posts = await feed.iterator().collect();
    console.debug( `[OrbitDB] Feed fetched with id ${feedId} and posts`, posts );
    return posts.map(post => post.payload.value.message);
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
