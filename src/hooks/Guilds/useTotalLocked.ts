import useEtherSWR from 'ether-swr';
import { SWRResponse } from 'swr';
import { BigNumber } from 'utils';

interface UseTotalLockedProps {
  contractAddress: string;
}

type UseTotalLockedHook = (args: UseTotalLockedProps) => SWRResponse<BigNumber>;

/**
 * Get the totalLocked
 */
export const useTotalLocked: UseTotalLockedHook = ({ contractAddress }) =>
  useEtherSWR([contractAddress, 'getTotalLocked']);
