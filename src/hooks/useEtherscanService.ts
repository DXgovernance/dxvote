import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { useContext } from '../contexts';

interface UseEtherscanServiceReturns {
  getContractABI: (address: string) => Promise<string>;
  getContractSource: (address: string) => Promise<string>;
  error: Error | null;
  loading: boolean;
}

export const useEtherscanService = (): UseEtherscanServiceReturns => {
  const {
    context: { etherscanService, configStore },
  } = useContext();

  const networkName = configStore.getActiveChainName();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const etherscanErrors = (etherscanResult: AxiosResponse<any>) => {
    switch (etherscanResult.data.status) {
      case '0':
        switch (etherscanResult.data.message) {
          case 'NOTOK':
            throw new Error(etherscanResult.data.result);
          default:
            break;
        }
        throw new Error(etherscanResult.data.message);
      case '1':
        switch (etherscanResult.data.message) {
          case 'OK-Missing/Invalid API Key, rate limit of 1/5sec applied':
            throw new Error(etherscanResult.data.message);
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  const getContractABI = async (address: string) => {
    try {
      setLoading(true);
      const ABI = await etherscanService.getContractABI(address, networkName);

      etherscanErrors(ABI);

      setLoading(false);
      return ABI.data.result;
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  };

  const getContractSource = async (address: string) => {
    try {
      setLoading(true);
      const source = await etherscanService.getContractSource(
        address,
        networkName
      );
      etherscanErrors(source);
      setLoading(false);
      return source.data.result;
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  };

  return {
    getContractABI,
    getContractSource,
    loading,
    error,
  };
};
