import { BigNumber } from './bignumber';
import { bnum, DEFAULT_TOKEN_DECIMALS, scale } from './index';

export function formatFee(fee: BigNumber) {
  return fee.times(100).toString() + '%';
}

export function formatPercentage(
  value: BigNumber,
  decimals: number,
  useLowerLimit = true
): string {
  if (
    value.times(100).decimalPlaces(decimals).lte(0.1) &&
    value.gt(0) &&
    useLowerLimit
  ) {
    return '<0.1%';
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
    decimalSeparator: '.',
  };
  return balance.toFormat(2, BigNumber.ROUND_DOWN, fmt);
};

export const numDigits = (value: BigNumber): number => {
  return value.toString().length;
};

export const roundUpToScale = (value: BigNumber): BigNumber => {
  const placesValue = numDigits(value.integerValue()) - 1;
  const scaledValue = value.shiftedBy(-placesValue);
  return scaledValue.integerValue(BigNumber.ROUND_UP).shiftedBy(placesValue);
};

export const denormalizeBalance = (
  normalizedBalance: string | BigNumber,
  decimals: number = DEFAULT_TOKEN_DECIMALS
): BigNumber => {
  return scale(bnum(normalizedBalance), decimals);
};

export const normalizeBalance = (
  amount: BigNumber,
  decimals: number = DEFAULT_TOKEN_DECIMALS
): BigNumber => {
  return scale(bnum(amount), -decimals);
};

export const formatNumberValue = (
  normalizedBalance: BigNumber,
  displayPrecision: number = 4,
  truncateAt?: number,
  roundDown: boolean = true
): string => {
  if (normalizedBalance.eq(0)) {
    return bnum(0).toFixed(displayPrecision);
  }

  let result = bnum(normalizedBalance)
    .decimalPlaces(
      displayPrecision,
      roundDown ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP
    )
    .toString();

  result = padToDecimalPlaces(result, displayPrecision);

  if (truncateAt && result.length > truncateAt) {
    return result.substring(0, 20) + '...';
  } else {
    return result;
  }
};

export const formatBalance = (
  balance: BigNumber,
  decimals: number = 18,
  precision: number = 4,
  roundDown: boolean = true
): string => {
  if (balance.eq(0)) {
    return bnum(0).toFixed(precision);
  }

  const result = scale(balance, -decimals)
    .decimalPlaces(
      precision,
      roundDown ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP
    )
    .toString();

  return padToDecimalPlaces(result, precision);
};

export const padToDecimalPlaces = (
  value: string,
  minDecimals: number
): string => {
  const split = value.split('.');
  const zerosToPad = split[1] ? minDecimals - split[1].length : minDecimals;

  if (zerosToPad > 0) {
    let pad = '';

    // Add decimal point if no decimal portion in original number
    if (zerosToPad === minDecimals) {
      pad += '.';
    }
    for (let i = 0; i < zerosToPad; i++) {
      pad += '0';
    }
    return value + pad;
  }
  return value;
};
