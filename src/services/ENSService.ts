import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { namehash, labelhash } from '@ensdomains/ensjs';
import { ethers } from 'ethers';
import RootContext from '../contexts';
import ensResolverABI from '../abis/ENSPublicResolver.json';
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

  async getResolverContract(ensName: string): Promise<any | null> {
    try {
      const web3 = this.web3Context.library;

      // The Resolver contract interface exposed by web3.js is no longer up-to-date.
      // https://github.com/ChainSafe/web3.js/issues/4553
      // Temporary workaround: Using our own ABIs instead
      const resolverWeb3JsContract = await web3.eth.ens.getResolver(ensName);
      const resolverAddress = await resolverWeb3JsContract.options.address;
      const resolver = new web3.eth.Contract(ensResolverABI, resolverAddress);
      return resolver;
    } catch (e) {
      return null;
    }
  }

  async resolveContentHash(ensName: string): Promise<string | null> {
    const web3 = this.web3Context.library;

    console.debug('[ENSService] dxvote.eth namehash:', namehash('dxvote.eth'));
    console.debug('[ENSService] cache labelhash:', labelhash('cache'));

    const contentHash = await web3.eth.ens.getContenthash(ensName);
    return contentHash && contentHash.decoded ? contentHash.decoded : null;
  }

  async resolveAvatarUri(ensName: string): Promise<string | null> {
    const resolver = await this.getResolverContract(ensName);
    console.log('ENSService', resolver);
    if (!resolver) return null;

    try {
      let avatar = await resolver.methods
        .text(namehash(ensName), 'avatar')
        .call();
      return avatar;
    } catch (e) {
      return null;
    }
  }
}
