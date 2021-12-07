import { useWeb3React } from '@web3-react/core';
import { Contract } from 'ethers';
import { Web3Provider } from 'ethers/providers';
import { namehash } from 'ethers/utils';
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
        const resolverAddress = await registrarContract.resolver(namehash(ensName));
        const provider = new Web3Provider(library.currentProvider);
        const resolver = getContract(resolverAddress, ensResolverABI, provider);
        return resolver;
      } catch (e) {
        console.error("[useENSResolver] Error getting ENS Resolver Contract", e);
        return null;
      }
    }

    getResolver(ensName).then(setResolver);
  }, [ensName, library, registrarContract]);

  return resolver;
}
