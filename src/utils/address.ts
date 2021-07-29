import { ethers, utils } from 'ethers';

export function shortenAddress(address, digits = 4) {
  if (!isAddress(address)) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${address.substring(0, digits + 2)}...${address.substring(
    42 - digits
  )}`;
}

export function isAddress(value) {
  try {
    return ethers.utils.getAddress(value.toLowerCase());
  } catch {
    return false;
  }
}

export function toChecksum(address) {
  return utils.getAddress(address);
}

export function toAddressStub(address) {
  const start = address.slice(0, 5);
  const end = address.slice(-3);
  return `${start}...${end}`;
}
