import { Contract } from 'ethers';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import ensResolverABI from '../../../abis/ENSPublicResolver.json';
import { getContract } from '../../../utils/contracts';
import useJsonRpcProvider from '../web3/useJsonRpcProvider';
import useENSRegistrar from './useENSRegistrar';

export default function useENSResolver(ensName: string, chainId?: number) {
  const [resolver, setResolver] = useState<Contract | null>(null);

  const provider = useJsonRpcProvider(chainId);
  const registrarContract = useENSRegistrar(chainId);

  useEffect(() => {
    if (!ensName) return setResolver(null);

    async function getResolver(ensName: string) {
      try {
        const resolverAddress = await registrarContract.resolver(
          utils.namehash(ensName)
        );
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
  }, [ensName, provider, registrarContract]);

  return resolver;
}
