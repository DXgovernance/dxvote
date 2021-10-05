import { useState, useEffect } from 'react';
import { useContext } from '../contexts';

interface UseEtherscanServiceReturns {
  contractABI: string;
  contractSource: string;
  error: Error | null;
  loading: boolean;
}

export const useEtherscanService = (
  address: string
): UseEtherscanServiceReturns => {
  const {
    context: { etherscanService },
  } = useContext();

  const [contractABI, setContractABI] = useState<string>();
  const [contractSource, setContractSource] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getContractABI = async (address: string) => {
    try {
      setLoading(true);
      const ABI = await (
        await etherscanService.getContractABI(address)
      ).data.result;
      setContractABI(ABI);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  };

  const getContractSource = async (address: string) => {
    try {
      setLoading(true);

      const source = await (
        await etherscanService.getContractSource(address)
      ).data.result;
      setContractSource(source);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getContractABI(address);
    getContractSource(address);
  }, [address]);

  return {
    contractABI,
    contractSource,
    loading,
    error,
  };
};
