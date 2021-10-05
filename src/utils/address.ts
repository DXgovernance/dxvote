import { ethers, utils } from 'ethers';
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
      if (networkName === 'arbitrum')
        return `https://explorer.arbitrum.io/#/address/${address}`;
      else if (networkName === 'arbitrumTestnet')
        return `https://rinkeby-explorer.arbitrum.io/#/address/${address}`;
      else if (networkName === 'mainnet')
        return `https://etherscan.io/address/${address}`;
      else if (networkName === 'xdai')
        return `https://blockscout.com/xdai/mainnet/address/${address}`;
      else return `https://${networkName}.etherscan.io/address/${address}`;
    default: // investigate DRY here
      if (networkName === 'arbitrum')
        return `https://explorer.arbitrum.io/#/tx/${address}`;
      else if (networkName === 'arbitrumTestnet')
        return `https://rinkeby-explorer.arbitrum.io/#/tx/${address}`;
      else if (networkName === 'mainnet')
        return `https://etherscan.io/tx/${address}`;
      else if (networkName === 'xdai')
        return `https://blockscout.com/xdai/mainnet/tx/${address}`;
      else return `https://${networkName}.etherscan.io/tx/${address}`;
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
  Object.keys(appConfig).forEach((network => {
    tokenObject = appConfig[network]?.tokens?.filter(token => token.address === address)
    if (tokenObject) return;
  }));
  return tokenObject;
}

export function getDxVoteContract(address) {
  let obj = null;
  Object.keys(appConfig).forEach(network => {
    let contracts = appConfig[network]?.contracts
    for (let [key, value] of Object.entries(contracts)) {
      if (value === address) {
        obj = {contract: key, address: value}
        return;
      }
    }
    return;
  });
  return obj;
}