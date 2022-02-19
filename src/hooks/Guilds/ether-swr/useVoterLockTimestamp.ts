import { BigNumber } from 'utils';
import useEtherSWR from './useEtherSWR';
import { useMemo } from 'react';
import { unix } from 'moment';

/**
 * Get the locked timestamp of a voter tokens
 * @param contractAddress address of the contract
 * @param userAddress address of the voter
 */
export const useVoterLockTimestamp = (
  contractAddress: string,
  userAddress: string
) => {
  const { data, ...rest } = useEtherSWR<BigNumber>(
    contractAddress && userAddress
      ? [contractAddress, 'getVoterLockTimestamp', userAddress]
      : []
  );

  // TODO: Move this into a SWR middleware
  const parsed = useMemo(() => {
    if (!data) return undefined;

    return unix(data.toNumber());
  }, [data]);

  return { data: parsed, ...rest };
};
