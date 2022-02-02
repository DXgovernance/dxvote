import useEtherSWR from './useEtherSWR';

/**
 * Get the token address
 */
export const useTokenAddress = (contractAddress: string) =>
  useEtherSWR<string>([contractAddress, 'getToken']);
