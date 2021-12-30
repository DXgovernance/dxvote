import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { bnum, denormalizeBalance, formatNumberValue } from 'utils';

interface UsePaymentAmountsReturns {
  dxdAmount: BigNumber;
  stableAmount: BigNumber;
  repReward: BigNumber;
  discount: number;
  calculateDiscountedValue: any;
  setDiscount: any;
}

export const usePaymentAmounts = (
  confirm: boolean,
  dxdPrice: number,
  dxdOverride: number,
  stableOverride: number,
  noRep: boolean,
  selectedLevel: any,
  totalSupply: BigNumber
): UsePaymentAmountsReturns => {
  const [dxdAmount, setDxdAmount] = useState(null);
  const [stableAmount, setStableAmount] = useState(null);
  const [repReward, setRepReward] = useState(null);
  const [discount, setDiscount] = useState(1);

  useEffect(() => {
    setDxdAmount(
      denormalizeBalance(
        bnum(
          (selectedLevel?.dxd / (dxdOverride ? dxdOverride : dxdPrice)) *
            discount
        )
      ).toString()
    );
    setStableAmount(
      denormalizeBalance(
        bnum(calculateDiscountedValue(selectedLevel?.stable, stableOverride))
      )
    );

    setRepReward(
      noRep
        ? 0
        : formatNumberValue(totalSupply.times(0.001667).times(discount), 0)
    );
  }, [
    confirm,
    discount,
    dxdPrice,
    dxdOverride,
    noRep,
    selectedLevel,
    totalSupply,
  ]);

  const calculateDiscountedValue = (amount, override = null) => {
    return override || amount * discount;
  };

  return {
    setDiscount,
    dxdAmount,
    stableAmount,
    repReward,
    discount,
    calculateDiscountedValue,
  };
};
