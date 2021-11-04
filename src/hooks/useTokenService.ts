import { useState, useEffect } from 'react';
import { useContext } from '../contexts';

interface UseABIServiceReturns {
  tokenData: any;
  tokenAth: number;
}

export const useTokenService = (token: String): UseABIServiceReturns => {
  const [tokenData, setTokenData] = useState();
  const [tokenAth, setAth] = useState();
  const {
    context: { coingeckoService },
  } = useContext();

  const getData = async () => {
    const data = await coingeckoService.getCoinData(token);
    setTokenData(data);
    setAth(data['market_data'].ath.usd);
  };

  useEffect(() => {
    getData();
  }, []);

  return {
    tokenData,
    tokenAth,
  };
};
