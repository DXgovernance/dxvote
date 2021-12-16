import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { ethers } from 'ethers';
import RootContext from '../contexts';
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

  async resolveENSName(address: string) {
    let name = null;
    try {
      const web3 = this.web3Context.library;
      const provider = new ethers.providers.Web3Provider(web3.currentProvider);
      const checksumed = ethers.utils.getAddress(address);
      name = await provider.lookupAddress(checksumed);
    } catch (e) {
      console.warn(
        '[ENSService] Error while trying to reverse resolve ENS address.'
      );
    }
    return name;
  }

  async resolveContentHash(ensName: string): Promise<string | null> {
    const web3 = this.web3Context.library;

    const contentHash = await web3.eth.ens.getContenthash(ensName);
    return contentHash && contentHash.decoded ? contentHash.decoded : null;
  }
}
