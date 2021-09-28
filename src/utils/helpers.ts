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

