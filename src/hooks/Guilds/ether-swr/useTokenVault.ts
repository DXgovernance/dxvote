import useEtherSWR from 'ether-swr';
import { SWRResponse } from 'swr';

interface UseVotingPowerProps {
  contractAddress: string;
}

type UseTokenVaultHook = (args: UseVotingPowerProps) => SWRResponse<string>;

/**
 * Get the tokenVault address
 */
export const useTokenVault: UseTokenVaultHook = ({ contractAddress }) =>
  useEtherSWR([contractAddress, 'getTokenVault']);
