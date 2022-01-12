import { Contract, constants, providers } from 'ethers';
import { isAddress } from '.';

function getSigner(
  library: providers.JsonRpcProvider,
  account: string
): providers.JsonRpcSigner {
  return library.getSigner(account);
}

function getProviderOrSigner(
  library: providers.JsonRpcProvider,
  account?: string
): providers.JsonRpcProvider | providers.JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: providers.JsonRpcProvider,
  account?: string
): Contract {
  if (!isAddress(address) || address === constants.AddressZero) {
    return null;
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}
