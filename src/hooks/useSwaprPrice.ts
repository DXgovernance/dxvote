import moment from 'moment';
import { useState, useEffect } from 'react';
import { useContext } from '../contexts';

interface UseAvgPriceReturns {
  avgPrice: any;
  loading: boolean;
}

export const useAvgPrice = (
  toDate: moment.Moment,
  days: number
): UseAvgPriceReturns => {
  const [avgPrice, setAvgPrice] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    context: { subgraphService, configStore },
  } = useContext();

  const networkContracts = configStore.getNetworkContracts();

  const getData = async () => {
    setLoading(true);
    setAvgPrice(null);
    const { data } = await subgraphService.dailyTokenPrice(
      networkContracts.votingMachines.dxd.token,
      moment(toDate).subtract(days, 'days'),
      toDate
    );
    let total = 0;
    Object.values<{ derivedNativeCurrency: string }>(data).forEach(
      ({ derivedNativeCurrency }) =>
        (total = total + parseInt(derivedNativeCurrency))
    );
    setAvgPrice(total / Object.values(data).length);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [toDate]);

  return {
    avgPrice,
    loading,
  };
};
