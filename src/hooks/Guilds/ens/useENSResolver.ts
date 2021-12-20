import { useWeb3React } from '@web3-react/core';
import { Contract } from 'ethers';
import { providers, utils } from 'ethers';
import { useEffect, useState } from 'react';
import ensResolverABI from '../../../abis/ENSPublicResolver.json';
import { getContract } from '../../../utils/contracts';
import useENSRegistrar from './useENSRegistrar';

export default function useENSResolver(ensName: string) {
  const [resolver, setResolver] = useState<Contract | null>(null);

  const { library } = useWeb3React();
  const registrarContract = useENSRegistrar();

  useEffect(() => {
    if (!ensName) return setResolver(null);

    async function getResolver(ensName: string) {
      try {
        const resolverAddress = await registrarContract.resolver(
          utils.namehash(ensName)
        );
        const provider = new providers.Web3Provider(library.currentProvider);
        const resolver = getContract(resolverAddress, ensResolverABI, provider);
        return resolver;
      } catch (e) {
        console.error(
          '[useENSResolver] Error getting ENS Resolver Contract',
          e
        );
        return null;
      }
    }

    getResolver(ensName).then(setResolver);
  }, [ensName, library, registrarContract]);

  return resolver;
}
