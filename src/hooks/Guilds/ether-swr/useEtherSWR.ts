import { useWeb3React } from '@web3-react/core';
import useEtherSWRHook, {
  etherKeyFuncInterface,
  ethKeyInterface,
  ethKeysInterface,
  EthSWRConfigInterface,
} from 'ether-swr';
import { useEffect } from 'react';
import { SWRResponse } from 'swr';
import { usePrevious } from '../usePrevious';

function useEtherSWR<Data = any, Error = any>(
  key: ethKeyInterface | ethKeysInterface | etherKeyFuncInterface
): SWRResponse<Data, Error>;
function useEtherSWR<Data = any, Error = any>(
  key: ethKeyInterface | ethKeysInterface | etherKeyFuncInterface,
  config?: EthSWRConfigInterface<Data, Error>
): SWRResponse<Data, Error>;
function useEtherSWR<Data = any, Error = any>(
  key: ethKeyInterface | ethKeysInterface | etherKeyFuncInterface,
  fetcher?: any,
  config?: EthSWRConfigInterface<Data, Error>
): SWRResponse<Data, Error>;
function useEtherSWR<Data = any, Error = any>(
  ...args: any[]
): SWRResponse<Data, Error> {
  // @ts-ignore - TS gets confused here about the number of args
  const swrResponse = useEtherSWRHook<Data, Error>(...args);
  const { chainId } = useWeb3React();

  const prevChainId = usePrevious(chainId);
  useEffect(() => {
    if (prevChainId && chainId !== prevChainId) {
      swrResponse.mutate(null);
    }
  }, [chainId, prevChainId, swrResponse]);

  return swrResponse;
}

export default useEtherSWR;
