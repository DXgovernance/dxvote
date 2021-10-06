import { ethers, utils } from 'ethers';
import { NETWORK_EXPLORERS } from 'utils';

const appConfig = require('../config.json');

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

export function getBlockchainLink(address, networkName, type) {
  switch (type) {
    case 'user':
      return `${window.location.pathname}#/user/${address}`;
    case 'address':
      return `${NETWORK_EXPLORERS[networkName]}/address/${address}`
    default:
      return `${NETWORK_EXPLORERS[networkName]}/tx/${address}`;
  }
}

export async function getENSName(address) {
  let name = null;
  try {
    const provider = ethers.getDefaultProvider();
    const checksumed = ethers.utils.getAddress(address);
    name = provider.lookupAddress(checksumed);
  }
  catch (e) {
    console.error(e);
  }
  return name;
} 

export function getERC20Token(address) {
  let tokenObject;
  let networks = Object.keys(appConfig)
  for (let i = 0; (i < networks.length && !tokenObject); i++) {
    tokenObject = appConfig[networks[i]]?.tokens?.find(token => token.address === address);
  }
  return tokenObject;
}

export function getDxVoteContract(address) {
  let contract;
  let networks = Object.keys(appConfig);
  for (let i = 0; (i < networks.length && !contract); i++) {
    let contracts = appConfig[networks[i]]?.contracts;
    for (let [key, value] of Object.entries(contracts)) {
      if (value === address) {
        contract = { contract: key, address: value }
        return;
      }
    }
  }
  return contract;
}