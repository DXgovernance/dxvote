import { ethers, providers } from 'ethers';
import RootContext from '../contexts';
export default class ENSService {
  context: RootContext;
  web3Provider: providers.JsonRpcProvider;

  constructor(context: RootContext) {
    this.context = context;
    this.web3Provider = null;
  }

  getWeb3Provider() {
    return this.web3Provider;
  }

  setWeb3Provider(web3Provider: providers.JsonRpcProvider) {
    console.debug('[ENSService] Setting Mainnet Web3 provider', web3Provider);
    this.web3Provider = web3Provider;
  }

  async resolveENSName(address: string) {
    let name = null;
    try {
      const checksumed = ethers.utils.getAddress(address);
      name = await this.web3Provider.lookupAddress(checksumed);
    } catch (e) {
      console.warn(
        '[ENSService] Error while trying to reverse resolve ENS address.'
      );
    }
    return name;
  }

  async resolveContentHash(ensName: string): Promise<string | null> {
    const resolver = await this.web3Provider.getResolver(ensName);
    const contentHash = await resolver.getContentHash();
    return contentHash.replace('ipfs://', '');
  }
}
