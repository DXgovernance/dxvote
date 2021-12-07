import { Contract } from 'ethers';
import { AddressZero } from 'ethers/constants';
import { JsonRpcSigner, Web3Provider } from 'ethers/providers';
import { isAddress } from '.';

function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account);
}

function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}
