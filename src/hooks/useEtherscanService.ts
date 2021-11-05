import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { useContext } from '../contexts';

interface UseEtherscanServiceReturns {
  getContractABI: (address: string) => Promise<string>;
  getContractSource: (address: string) => Promise<string>;
  error: Error | null;
  loading: boolean;
}

interface EtherscanResponse {
  status: '0' | '1';
  message: string;
  result: string;
}

enum EtherscanErrors {
  MaxLimit = 'Max rate limit reached',
  MissingAPI = 'OK-Missing/Invalid API Key, rate limit of 1/5sec applied',
  invalidAPI = 'Invalid API Key',
  tooManyAttempts = 'Too many invalid api key attempts, please try again later',
}

export const useEtherscanService = (): UseEtherscanServiceReturns => {
  const {
    context: { etherscanService, configStore },
  } = useContext();

  const networkName = configStore.getActiveChainName();
  const contracts = configStore.getNetworkContracts();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const checkEtherscanErrors = (
    etherscanResult: AxiosResponse<EtherscanResponse>
  ) => {
    if (
      Object.values<string>(EtherscanErrors).includes(
        etherscanResult.data.result || etherscanResult.data.message
      )
    ) {
      throw new Error('API');
    }
  };

  const getContractABI = async (address: string) => {
    try {
      setLoading(true);

      if (address === contracts.controller) {
        return JSON.stringify(require('../contracts/DxController.json').abi);
      }

      const ABI = await etherscanService.getContractABI(address, networkName);
      checkEtherscanErrors(ABI);

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
      checkEtherscanErrors(source);
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
