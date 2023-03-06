import { ethers, utils } from 'ethers';
import { NETWORK_EXPLORERS } from './index';
import { getAppConfig } from './cache';

export function shortenAddress(address, digits = 4) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${address.substring(0, digits + 2)}...${address.substring(
    42 - digits
  )}`;
}

export function isAddress(value: string) {
  try {
    return ethers.utils.getAddress(value.toLowerCase());
  } catch {
    return false;
  }
}

export function toChecksum(address) {
  return utils.getAddress(address);
}

export function toAddressStub(address, size = 'default') {
  const start = address.slice(0, 6);
  const end = address.slice(-4);

  switch (size) {
    case 'short':
      return `${start}..`;
    case 'long':
      return address;
    default:
      return `${start}...${end}`;
  }
}

export function getBlockchainLink(
  address: string,
  networkName: string,
  type?: string
) {
  switch (type) {
    case 'user':
      return `${window.location.pathname}#/user/${address}`;
    case 'address':
      return `${NETWORK_EXPLORERS[networkName]}/address/${address}`;
    default:
      return `${NETWORK_EXPLORERS[networkName]}/tx/${address}`;
  }
}

export function getERC20Token(address) {
  let tokenObject;
  Object.entries(getAppConfig()).forEach(([_, value]) => {
    if (!tokenObject)
      tokenObject = value?.tokens?.find(token => token.address === address);
  });
  return tokenObject;
}

export function getDxVoteContract(address) {
  let contract;
  Object.entries(getAppConfig()).forEach(([_, value]) => {
    Object.entries(value?.contracts).forEach(([name, value]) => {
      if (!contract && value === address)
        contract = { contract: name, address: value };
    });
  });
  return contract;
}
