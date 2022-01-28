import { SWRResponse } from 'swr';
import useEtherSWR from './useEtherSWR';

interface UseVotingPowerProps {
  contractAddress: string;
}

type UseTokenVaultHook = (args: UseVotingPowerProps) => SWRResponse<string>;

/**
 * Get the tokenVault address
 */
export const useTokenVault: UseTokenVaultHook = ({ contractAddress }) =>
  useEtherSWR([contractAddress, 'getTokenVault']);
