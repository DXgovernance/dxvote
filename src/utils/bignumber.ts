import { BigNumber } from 'bignumber.js';

BigNumber.config({
    EXPONENTIAL_AT: [-100, 100],
    ROUNDING_MODE: BigNumber.ROUND_DOWN,
    DECIMAL_PLACES: 18,
    FORMAT: {
      groupSize: 3,
      groupSeparator: ' ',
      decimalSeparator: '.'
    }
});

export { BigNumber };
