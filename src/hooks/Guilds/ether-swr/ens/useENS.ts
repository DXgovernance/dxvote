import { isAddress } from '../../../../utils';
import useAddressFromENSName from './useAddressFromENSName';
import useENSNameFromAddress from './useENSNameFromAddress';

export default function useENS(nameOrAddress: string, chainId?: number) {
  const validAddress = isAddress(nameOrAddress);
  const resolvedAddress = useAddressFromENSName(
    !validAddress ? nameOrAddress : undefined,
    chainId
  );

  const resolvedENSName = useENSNameFromAddress(
    validAddress || undefined,
    chainId
  );

  return {
    address: validAddress || resolvedAddress,
    name: resolvedENSName || (resolvedAddress ? nameOrAddress : null),
  };
}
