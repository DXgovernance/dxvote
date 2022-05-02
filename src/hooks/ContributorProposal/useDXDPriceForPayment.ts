import moment from 'moment';
import { useState, useEffect } from 'react';
import { useContext } from '../../contexts';

interface UseDXDPriceReturns {
  dxdPrice: any;
  loading: boolean;
}

// DXD price used for contributor compensation calculations
export const useDXDPrice = (
  toDate: moment.Moment,
  days: number
): UseDXDPriceReturns => {
  const [dxdPrice, setDXDPrice] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    context: { subgraphService, configStore },
  } = useContext();

  const networkContracts = configStore.getTokensOfNetwork();

  const getData = async () => {
    setLoading(true);
    setDXDPrice(null);
    const { data } = await subgraphService.dailyTokenPrice(
      networkContracts.find(({ name }) => name === 'DXdao on xDai').address,
      moment(toDate).subtract(days, 'days'),
      toDate
    );
    let total = 0;
    console.log({ data });
    Object.values<{ derivedNativeCurrency: string }>(data).forEach(
      ({ derivedNativeCurrency }) =>
        (total = total + parseInt(derivedNativeCurrency))
    );
    const avg = total / Object.values(data).length;

    // Minimum DXD price for compensation limited to $523
    setDXDPrice(avg < 523 ? 523 : avg);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [toDate]);

  return {
    dxdPrice,
    loading,
  };
};
