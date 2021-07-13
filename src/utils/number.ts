import { BigNumber } from './bignumber';
import { bnum } from './helpers';

export function formatFee(fee: BigNumber) {
    return fee.times(100).toString() + '%';
}

export function formatPercentage(
    value: BigNumber,
    decimals: number,
    useLowerLimit = true
): string {
    if (value.lte(0.01) && value.gt(0) && useLowerLimit) {
        return '<0.01%';
    }
    return `${value.times(100).decimalPlaces(decimals).toString()}%`;
}

export function fromPercentage(value: BigNumber | string): BigNumber {
    const bn = bnum(value.toString());
    return bn.div(100);
}

export function toPercentage(value: BigNumber | string): BigNumber {
    const bn = bnum(value.toString());
    return bn.times(100);
}

export const normalizePriceValues = (
    inputValue: BigNumber,
    outputValue: BigNumber
): {
    normalizedInput: BigNumber;
    normalizedOutput: BigNumber;
} => {
    const multiplier = bnum(1).div(inputValue);
    return {
        normalizedInput: bnum(1),
        normalizedOutput: outputValue.times(multiplier),
    };
};

export const formatCurrency = (balance: BigNumber): string => {
    const fmt = {
      groupSize: 3,
      groupSeparator: ' ',
      decimalSeparator: '.'
    };
    return balance.toFormat(2, BigNumber.ROUND_DOWN, fmt);
};

export const numDigits = (value: BigNumber): number => {
    return value.toString().length;
};

export const roundUpToScale = (
    value: BigNumber
): BigNumber => {
    const placesValue = numDigits(value.integerValue())-1;
    const scaledValue = value
        .shiftedBy(-placesValue);
    return scaledValue.integerValue(BigNumber.ROUND_UP).shiftedBy(placesValue);
};
