import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import RootContext from '../contexts';
import { namehash, labelhash } from '@ensdomains/ensjs';

export default class ENSService {
  context: RootContext;
  web3Context: Web3ReactContextInterface;

  constructor(context: RootContext) {
    this.context = context;
    this.web3Context = null;
  }

  getENSWeb3Context(): Web3ReactContextInterface {
    return this.web3Context;
  }

  setENSWeb3Context(context: Web3ReactContextInterface) {
    console.debug('[ENSService] Setting Mainnet Web3 context', context);
    this.web3Context = context;
  }

  async resolveContentHash(ensAddress: string): Promise<string | null> {
    const web3 = this.web3Context.library;

    console.debug('[ENSService] dxvote.eth namehash:', namehash('dxvote.eth'));
    console.debug('[ENSService] cache labelhash:', labelhash('cache'));

    const contentHash = await web3.eth.ens.getContenthash(ensAddress);
    return contentHash && contentHash.decoded ? contentHash.decoded : null;
  }
}
