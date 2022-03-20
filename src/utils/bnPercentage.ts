import { BigNumber } from 'ethers';

// Used to calculate percentages of big numbers due to decimal limitation for things like voting power
export function getBigNumberPercentage(
  amount: BigNumber,
  totalAmount: BigNumber,
  precision: number = 2
) {
  if (!amount || !totalAmount) return null;

  if (totalAmount.isZero()) return 0;

  const percent = amount.mul(100).mul(Math.pow(10, precision)).div(totalAmount);
  return Math.round(percent.toNumber()) / Math.pow(10, precision);
}
