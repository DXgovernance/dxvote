import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useState } from 'react';
import { MAINNET_WEB3_ROOT_KEY } from '../components/MainnetWeb3Manager';
import { useContext } from '../contexts';
import { bnum, ZERO_ADDRESS } from '../utils';

const AVG_ETH_BLOCKS_PER_DAY = 6500;

const useMainnetRep = (
  userAddress: string = ZERO_ADDRESS,
  atBlock: number = 0,
  atTime: number = 0
) => {
  const {
    context: { configStore, ipfsService, daoStore },
  } = useContext();
  const { library } = useWeb3React(MAINNET_WEB3_ROOT_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [userRep, setUserRep] = useState(bnum(0));
  const [totalSupply, setTotalSupply] = useState(bnum(0));

  const fetchLatestCache = useCallback(
    async function () {
      let localCache: DaoNetworkCache & { baseCacheIpfsHash?: string };
      try {
        const cache = await caches.open(`dxvote-cache`);
        let match = await cache.match('mainnet');
        localCache = JSON.parse(await match.text());
      } catch (e) {
        console.error("[useMainnetRep] Couldn't fetch cache locally");
      }

      const newestCacheIpfsHash = configStore.getCacheIPFSHash('mainnet');

      if (
        !localCache ||
        !(newestCacheIpfsHash === localCache.baseCacheIpfsHash)
      ) {
        const unparsedCacheData = await ipfsService.getContentFromIPFS(
          newestCacheIpfsHash
        );
        let networkCache: DaoNetworkCache & { baseCacheIpfsHash?: string } =
          daoStore.parseCache(unparsedCacheData);
        networkCache.baseCacheIpfsHash = newestCacheIpfsHash;

        if (!localCache || localCache.blockNumber <= networkCache.blockNumber) {
          localCache = networkCache;
        }
      }

      // TODO: We should actually update the cache data until the current block
      // instead of using the already existing cache.

      return localCache;
    },
    [configStore, daoStore, ipfsService]
  );

  const getRepAt = useCallback(
    async function (
      userAddress: string = ZERO_ADDRESS,
      atBlock: number = 0,
      atTime: number = 0
    ) {
      const cache = await fetchLatestCache();
      const repEvents = cache.daoInfo.repEvents;
      let userRep = bnum(0),
        totalSupply = bnum(0);

      const currentBlockNumber = await library.eth.getBlockNumber();

      if (atBlock === 0) atBlock = currentBlockNumber;

      // Flag to check if the cache is from past 7 days
      const isStale =
        cache.blockNumber < currentBlockNumber - AVG_ETH_BLOCKS_PER_DAY * 7;

      for (let i = 0; i < repEvents.length; i++) {
        if (
          atTime > 0
            ? repEvents[i].timestamp < atTime
            : repEvents[i].blockNumber < atBlock
        ) {
          if (repEvents[i].event === 'Mint') {
            totalSupply = totalSupply.plus(repEvents[i].amount);
            if (repEvents[i].account === userAddress)
              userRep = userRep.plus(repEvents[i].amount);
          } else if (repEvents[i].event === 'Burn') {
            totalSupply = totalSupply.minus(repEvents[i].amount);
            if (repEvents[i].account === userAddress)
              userRep = userRep.minus(repEvents[i].amount);
          }
        }
      }
      return { userRep, totalSupply, isStale };
    },
    [fetchLatestCache, library]
  );

  useEffect(() => {
    if (library) {
      setIsLoading(true);
      getRepAt(userAddress, atBlock, atTime)
        .then(({ userRep, totalSupply, isStale }) => {
          setUserRep(userRep);
          setTotalSupply(totalSupply);
          setIsStale(isStale);
        })
        .catch(e => {
          console.error('[useMainnetRep] Error getting rep from Mainnet', e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [library, atBlock, atTime, getRepAt, userAddress]);

  return { isLoading, userRep, totalSupply, isStale };
};

export default useMainnetRep;
