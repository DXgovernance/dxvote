import { ValidationRules } from 'react-form-validator-core';
import { BigNumber } from './bignumber';
import { bnum } from './helpers';

export enum ValidationStatus {
    VALID = 'Valid',
    EMPTY = 'Empty',
    ZERO = 'Zero',
    NOT_FLOAT = 'Not Float',
    NEGATIVE = 'Negative',
    INSUFFICIENT_BALANCE = 'Insufficient Balance',
    NO_POOLS = 'There are no Pools with selected tokens',
    MAX_DIGITS_EXCEEDED = 'Maximum Digits Exceeded',
    MAX_VALUE_EXCEEDED = 'Maximum Value Exceeded',
    MIN_VALUE_NOT_EXCEEDED = 'Below minimum investment',
}

export const validateTokenValue = (
    value: string,
    options?: {
        maxBalance?: BigNumber | undefined;
        minValue?: BigNumber | undefined;
        limitDigits?: boolean;
    }
): ValidationStatus => {
    if (ValidationRules.isEmpty(value)) {
        return ValidationStatus.EMPTY;
    }

    if (value.substr(0, 1) === '.') {
        value = '0' + value;
    }
    if (!ValidationRules.isFloat(value)) {
        return ValidationStatus.NOT_FLOAT;
    }

    if (parseFloat(value).toString() === '0') {
        return ValidationStatus.ZERO;
    }

    if (!ValidationRules.isPositive(value)) {
        return ValidationStatus.NEGATIVE;
    }

    // Is a valid positive number, beyond this point

    if (options && options.limitDigits) {
        // restrict to 2 decimal places
        const acceptableValues = [/^$/, /^\d{1,2}$/, /^\d{0,2}\.\d{0,2}$/];
        // if its within accepted decimal limit, update the input state
        if (!acceptableValues.some((a) => a.test(value))) {
            return ValidationStatus.MAX_DIGITS_EXCEEDED;
        }
    }
    
    if (options && options.maxBalance) {
        const valueBN = bnum(value);
        if (valueBN.gt(options.maxBalance)) {
            return ValidationStatus.INSUFFICIENT_BALANCE;
        }
    }

    if (options && options.minValue) {
        const valueBN = bnum(value);
        if (valueBN.lt(options.minValue)) {
            return ValidationStatus.MIN_VALUE_NOT_EXCEEDED;
        }
    }

    return ValidationStatus.VALID;
};
