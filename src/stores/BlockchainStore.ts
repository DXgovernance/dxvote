import RootContext from '../contexts';
import { makeObservable, observable, action } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { isChainIdSupported } from '../provider/connectors';
import { CacheLoadError } from '../utils/errors';

const targetCacheVersion = 1;

export default class BlockchainStore {
  activeFetchLoop: boolean = false;
  initialLoadComplete: boolean;
  context: RootContext;

  constructor(context) {
    this.context = context;
    makeObservable(this, {
      activeFetchLoop: observable,
      initialLoadComplete: observable,
      fetchData: action,
      reset: action,
    });
  }

  reset() {
    this.activeFetchLoop = false;
    this.initialLoadComplete = false;
  }

  async fetchData(web3React: Web3ReactContextInterface, reset: boolean) {
    if (
      (!this.activeFetchLoop || reset) &&
      web3React &&
      web3React.active &&
      isChainIdSupported(web3React.chainId)
    ) {
      const {
        providerStore,
        configStore,
        ipfsService,
        daoStore,
        notificationStore,
        cacheService,
      } = this.context;

      this.initialLoadComplete = reset ? false : this.initialLoadComplete;
      this.activeFetchLoop = true;
      if (reset) notificationStore.reset();

      try {
        const { library, chainId } = web3React;

        const networkName = configStore.getActiveChainName();

        notificationStore.setGlobalLoading(
          true,
          'Looking for latest chain configurations'
        );
        await configStore.loadNetworkConfig();

        notificationStore.setGlobalLoading(
          true,
          'Looking for existing cache data'
        );
        const cache = await caches.open(`dxvote-cache`);
        let match = await cache.match(networkName);
        let networkCache: DaoNetworkCache & { baseCacheIpfsHash?: string } =
          null;
        if (match) {
          networkCache = JSON.parse(await match.text());
        }

        if (
          networkCache &&
          (!networkCache?.version ||
            networkCache?.version !== targetCacheVersion)
        ) {
          console.log('[Upgrade Cache]');
          networkCache = null;
        }

        const blockNumber = (await library.eth.getBlockNumber()) - 1;

        const newestCacheIpfsHash = configStore.getCacheIPFSHash(networkName);

        if (
          !networkCache ||
          !(newestCacheIpfsHash === networkCache.baseCacheIpfsHash)
        ) {
          console.debug('[IPFS Cache Fetch]', networkName, newestCacheIpfsHash);
          notificationStore.setGlobalLoading(
            true,
            'Fetching cached data from IPFS'
          );
          networkCache = daoStore.parseCache(
            await ipfsService.getContentFromIPFS(newestCacheIpfsHash)
          );
          networkCache.baseCacheIpfsHash = newestCacheIpfsHash;
        }

        const lastCheckedBlockNumber = networkCache.blockNumber;

        if (blockNumber > lastCheckedBlockNumber + 1) {
          console.debug(
            '[Fetch Loop] Fetch Blockchain Data',
            blockNumber,
            chainId
          );

          const fromBlock = lastCheckedBlockNumber + 1;
          const toBlock = blockNumber;
          const networkContracts = configStore.getNetworkContracts();

          networkCache = await cacheService.getUpdatedCache(
            this.context,
            networkCache,
            networkContracts,
            fromBlock,
            toBlock,
            library
          );

          notificationStore.setGlobalLoading(
            true,
            `Getting proposal titles form ipfs`
          );
          const proposalTitles = await cacheService.getProposalTitlesFromIPFS(
            networkCache,
            configStore.getProposalTitlesInBuild()
          );

          Object.keys(networkCache.proposals).map(proposalId => {
            networkCache.proposals[proposalId].title =
              networkCache.proposals[proposalId].title ||
              proposalTitles[proposalId] ||
              '';
          });

          networkCache.blockNumber = toBlock;
          providerStore.setCurrentBlockNumber(toBlock);

          notificationStore.setGlobalLoading(true, 'Saving updated cache');
          await cache.put(
            networkName,
            new Response(JSON.stringify(networkCache))
          );
        }
        daoStore.setCache(networkCache);
        this.initialLoadComplete = true;
        notificationStore.setFirstLoadComplete();
        this.activeFetchLoop = false;
      } catch (error) {
        console.error(error);
        if (!this.initialLoadComplete) {
          notificationStore.setGlobalError(true, (error as Error).message);
        } else {
          throw new CacheLoadError(error.message);
        }
        this.activeFetchLoop = false;
      }
    }
  }
}
