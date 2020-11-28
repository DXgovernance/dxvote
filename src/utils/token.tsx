// Token Scale -> Wei Scale
import { BigNumber } from './bignumber';
import { bnum, DEFAULT_TOKEN_DECIMALS, scale } from './helpers';

export const denormalizeBalance = (
    normalizedBalance: string | BigNumber,
    decimals: number = DEFAULT_TOKEN_DECIMALS
): BigNumber => {
    return scale(bnum(normalizedBalance), decimals);
};

// Wei Scale -> Token Scale
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
        .decimalPlaces(displayPrecision, roundDown ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP)
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
        .decimalPlaces(precision, roundDown ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP)
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
