import { SWRResponse } from 'swr';
import { BigNumber } from 'utils';
import useEtherSWR from './useEtherSWR';

interface UseTotalLockedProps {
  contractAddress: string;
}

type UseTotalLockedHook = (args: UseTotalLockedProps) => SWRResponse<BigNumber>;

/**
 * Get the totalLocked
 */
export const useTotalLocked: UseTotalLockedHook = ({ contractAddress }) =>
  useEtherSWR([contractAddress, 'getTotalLocked']);
