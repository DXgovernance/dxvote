// Libraries
import { ethers, utils } from 'ethers';
import { BigNumber } from './bignumber';

BigNumber.config({
  DECIMAL_PLACES: 2,
  FORMAT: {
    groupSize: 3,
    groupSeparator: ' ',
    decimalSeparator: '.'
  }
});

// Utils
export const MAX_GAS = utils.bigNumberify('0xffffffff');
export const MAX_UINT = utils.bigNumberify(ethers.constants.MaxUint256);
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ANY_ADDRESS = "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa";
export const ANY_FUNC_SIGNATURE = "0xaaaaaaaa";
export const ERC20_TRANSFER_SIGNATURE = "0xa9059cbb";

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
    return amount.gte(bnum(MAX_UINT.div(2).toString()));
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

export function getQueryParam(windowLocation, name) {
    var q = windowLocation.search.match(
        new RegExp('[?&]' + name + '=([^&#?]*)')
    );
    return q && q[1];
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const copyToClipboard = (e) => {
    const value = e.target.title.replace(',', '');
    var aux = document.createElement('input');
    aux.setAttribute('value', value);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand('copy');
    document.body.removeChild(aux);
    alert(`Value: "${value}" copied to clipboard`);
};
