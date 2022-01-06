import { isAddress } from '../../../utils';
import useENSAddress from './useENSAddress';
import useENSName from './useENSName';

export default function useENS(nameOrAddress: string, chainId?: number) {
  const validAddress = isAddress(nameOrAddress);
  const reverseLookup = useENSName(
    validAddress ? validAddress : undefined,
    chainId
  );
  const lookup = useENSAddress(
    !validAddress ? nameOrAddress : undefined,
    chainId
  );

  return {
    loading: reverseLookup.loading || lookup.loading,
    address: validAddress ? validAddress : lookup.address,
    name: reverseLookup.ensName
      ? reverseLookup.ensName
      : !validAddress && lookup.address
      ? nameOrAddress || null
      : null,
  };
}
