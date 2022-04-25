import { BigNumber as bn } from 'ethers';
import { BigNumber } from './bignumber';
import { MAX_UINT } from './constants';

type EnumType = { [s: number]: string };

export function mapEnum(enumerable: EnumType, fn: Function): any[] {
  // get all the members of the enum
  let enumMembers: any[] = Object.keys(enumerable).map(key => enumerable[key]);

  // enum contains both string and number representations of the enum ["None", 0]
  // we are only interested in the numeric identifiers as these represent the values
  let enumValues: number[] = enumMembers.filter(v => typeof v === 'number');

  // now map through the enum number values
  return enumValues.map(m => fn(m));
}

export function toCamelCaseString(text: string): string {
  if (text.length > 0) return text.replace(/^./, text[0].toUpperCase());
  else return '';
}

export function bnum(val: string | number | bn | BigNumber): BigNumber {
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

export const appendEthAPIKey = (
  networkName: string,
  etherscanAPIKey: string
) => {
  if (!['arbitrum', 'xdai', 'arbitrumTestnet'].includes(networkName)) {
    return etherscanAPIKey;
  }
  return '';
};

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export async function retryPromise(
  promise: Promise<any>,
  timeToWait: number = 0,
  maxTries: number = 10
): Promise<any> {
  let toReturn;
  while (!toReturn && maxTries > 0) {
    try {
      toReturn = await promise;
      if (!toReturn) {
        await sleep(timeToWait);
        maxTries--;
      }
    } catch (error) {
      console.warn(error);
      await sleep(timeToWait);
      maxTries--;
    } finally {
      if (maxTries === 0) console.error('[RETRY PROMISE] (max errors reached)');
      else maxTries = 0;
    }
  }
  return toReturn;
}
