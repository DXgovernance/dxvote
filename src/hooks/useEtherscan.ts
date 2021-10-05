import React, { useState, useEffect } from 'react';
import { useContext } from '../contexts';

interface UseEtherscanService {
  contractABI: string | null;
  contractSource: string | null;
  isAuthenticated: boolean;
}

export const useEtherscanService = (address: string): UseEtherscanService => {
  const {
    context: { etherscanService },
  } = useContext();

  const [contractABI, setContractABI] = useState<string | null>(null);
  const [contractSource, setContractSource] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const getContractABI = async (address: string) => {
    const ABI = await etherscanService.getContractABI(address);
    setContractABI(ABI as any);
  };

  const getContractSource = async (address: string) => {
    const source = await etherscanService.getContractSource(address);
    setContractSource(source as any);
  };

  const Authenticated = async () => {
    const auth = await etherscanService.isAuthenticated();
    setIsAuthenticated(auth as any);
  };
  useEffect(() => {
    getContractABI(address);
    getContractSource(address);
    Authenticated();
  }, [address]);

  return {
    contractABI,
    contractSource,
    isAuthenticated,
  };
};
