import { useState, useEffect } from 'react';
import { ContractType } from 'stores/Provider';
import { useContext } from '../contexts';
import { useEtherscanService } from './useEtherscanService';

interface decodeABIParams {
  data: string;
  contractType?: ContractType;
}
interface UseABIServiceReturns {
  ABI: string;
  decodeABI: (params: decodeABIParams) => DecodedABI
}

interface DecodedABI {
    function: any;
    args: any;
}
/**
 * parse's ABI and returns a react component detailing the to, from, and functions calls
 */
export const useABIService = (address: string): UseABIServiceReturns => {
  const [ABI, setABI] = useState<DecodedABI>();
  const { contractABI, loading, error } = useEtherscanService(address);
  const {
    context: { abiService },
  } = useContext();

  const decodeABI = (data:string, contractType: ContractType) =>
    abiService.decodeCall(data, contractType, contractABI);

  useEffect(() => {
    setABI(
    decodeABI(data, contractType);
    );
  }, []);

  return {
    ABI,
    decodeABI,
    loading, 
    error
  };
};
