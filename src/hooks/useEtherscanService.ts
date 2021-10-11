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

  const getContractABI = async (address: string) => {
    try {
      setLoading(true);
      const ABI = await etherscanService.getContractABI(address, networkName);

      if (ABI.data.status == '0') {
        throw new Error(ABI.data.result);
      }
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
      if (source.data.status == '0') {
        throw new Error(source.data.result);
      }
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
