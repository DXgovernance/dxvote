import { utils } from 'ethers';
import { BigNumber } from './bignumber';
import { MAX_UINT } from './constants';

export function toCamelCaseString(text: string): string {
  if (text.length > 0) return text.replace(/^./, text[0].toUpperCase());
  else return '';
}

export function bnum(
  val: string | number | utils.BigNumber | BigNumber
): BigNumber {
  return new BigNumber(val.toString());
}

export function scale(input: BigNumber, decimalPlaces: number): BigNumber {
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return input.times(scaleMul);
}

export function setPropertyToMaxUintIfEmpty(value?): string {
  if (!value || value === 0 || value === '') {
    value = MAX_UINT.toString();
  }
  return value;
}

export function setPropertyToZeroIfEmpty(value?): string {
  if (!value || value === '') {
    value = '0';
  }
  return value;
}

export function hasMaxApproval(amount: BigNumber): boolean {
  return amount.gte(bnum(bnum(MAX_UINT).div(2).toString()));
}

export function isEmpty(str: string): boolean {
  return !str || 0 === str.length;
}

export function roundValue(value, decimals = 4): string {
  const decimalPoint = value.indexOf('.');
  if (decimalPoint === -1) {
    return value;
  }
  return value.slice(0, decimalPoint + decimals + 1);
}

export function str(value: any): string {
  return value.toString();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseCamelCase(text) {
  const parsed = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  return parsed[0].toUpperCase() + parsed.substring(1);
}

export function getBlockchainLink(text, networkName, type) {
  switch (type) {
    case 'user':
      return `${window.location.pathname}#/user/${text}`;
    case 'address':
      if (networkName === 'arbitrum')
        return `https://explorer.arbitrum.io/#/address/${text}`;
      else if (networkName === 'arbitrumTestnet')
        return `https://rinkeby-explorer.arbitrum.io/#/address/${text}`;
      else if (networkName === 'mainnet')
        return `https://etherscan.io/address/${text}`;
      else if (networkName === 'xdai')
        return `https://blockscout.com/xdai/mainnet/address/${text}`;
      else return `https://${networkName}.etherscan.io/address/${text}`;
    default:
      if (networkName === 'arbitrum')
        return `https://explorer.arbitrum.io/#/tx/${text}`;
      else if (networkName === 'arbitrumTestnet')
        return `https://rinkeby-explorer.arbitrum.io/#/tx/${text}`;
      else if (networkName === 'mainnet')
        return `https://etherscan.io/tx/${text}`;
      else if (networkName === 'xdai')
        return `https://blockscout.com/xdai/mainnet/tx/${text}`;
      else return `https://${networkName}.etherscan.io/tx/${text}`;
  }
}

export const memoize = fn => {
  // temp helper to reduce API calls
  // remove when services are re-written to use useMemo
  let cache = {};
  return (...args) => {
    let n = args[0];
    if (n in cache) {
      console.log('Fetching from cache');
      return cache[n];
    } else {
      console.log('Calculating result');
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};
