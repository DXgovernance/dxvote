import useEtherSWR from 'ether-swr';
import { SWRResponse } from 'swr';
import { BigNumber } from 'utils';

interface UseLockTimeProps {
  contractAddress: string;
}

type UseLockTimeHook = (args: UseLockTimeProps) => SWRResponse<BigNumber>;

/**
 * Get the getLockTime
 */
export const useLockTime: UseLockTimeHook = ({ contractAddress }) =>
  useEtherSWR([contractAddress, 'getLockTime']);
