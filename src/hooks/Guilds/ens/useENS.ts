import { MAINNET_WEB3_ROOT_KEY } from '../../../components/MainnetWeb3Manager';
import { isAddress } from '../../../utils';
import useENSAddress from './useENSAddress';
import useENSName from './useENSName';

export default function useENS(
  nameOrAddress: string,
  web3Context: string = MAINNET_WEB3_ROOT_KEY
) {
  const validAddress = isAddress(nameOrAddress);
  const reverseLookup = useENSName(validAddress ? validAddress : undefined, web3Context);
  const lookup = useENSAddress(nameOrAddress, web3Context);

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
