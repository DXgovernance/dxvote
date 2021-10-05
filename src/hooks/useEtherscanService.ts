import React, { useState, useEffect } from 'react';
import { useContext } from '../contexts';

interface UseEtherscanService {
  contractABI: string | null;
  contractSource: string | null;
}

export const useEtherscanService = (address: string): UseEtherscanService => {
  const {
    context: { etherscanService },
  } = useContext();

  const [contractABI, setContractABI] = useState<string | null>(null);
  const [contractSource, setContractSource] = useState<string | null>(null);

  const getContractABI = async (address: string) => {
    const ABI = await (
      await etherscanService.getContractABI(address)
    ).data.result;
    setContractABI(ABI);
  };

  const getContractSource = async (address: string) => {
    const source = await (
      await etherscanService.getContractSource(address)
    ).data.result;
    setContractSource(source);
  };

  useEffect(() => {
    getContractABI(address);
    getContractSource(address);
  }, [address]);

  return {
    contractABI,
    contractSource,
  };
};
