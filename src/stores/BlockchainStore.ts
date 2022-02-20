import RootContext from '../contexts';
import { makeObservable, observable, action } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { isChainIdSupported } from '../provider/connectors';
import { ContractType } from './Provider';
import { bnum } from '../utils';
import { CacheLoadError } from '../utils/errors';

export default class BlockchainStore {
  activeFetchLoop: boolean = false;
  initialLoadComplete: boolean;
  contractStorage: ContractStorage = {};
  context: RootContext;

  constructor(context) {
    this.context = context;
    makeObservable(this, {
      activeFetchLoop: observable,
      initialLoadComplete: observable,
      updateStore: action,
      fetchData: action,
      reset: action,
    });
  }

  reset() {
    this.activeFetchLoop = false;
    this.initialLoadComplete = false;
    this.contractStorage = {};
  }

  reduceMulticall(
    calls: Call[],
    results: any,
    blockNumber: number
  ): CallEntry[] {
    const { multicallService } = this.context;
    return calls.map((call, index) => {
      const value = multicallService.decodeCall(call, results[index]);
      return {
        contractType: call.contractType,
        address: call.address,
        method: call.method,
        params: call.params,
        response: {
          value: value,
          lastFetched: blockNumber,
        },
      };
    });
  }

  async executeAndUpdateMulticall(multicallService) {
    const multicallResponse = await multicallService.executeCalls();
    this.updateStore(
      this.reduceMulticall(
        multicallResponse.calls,
        multicallResponse.results,
        multicallResponse.blockNumber
      ),
      multicallResponse.blockNumber
    );
    multicallService.resetActiveCalls();
  }

  has(entry: Call): boolean {
    const params = entry.params ? entry.params : [];
    return (
      !!this.contractStorage[entry.contractType] &&
      !!this.contractStorage[entry.contractType][entry.address] &&
      !!this.contractStorage[entry.contractType][entry.address][entry.method] &&
      !!this.contractStorage[entry.contractType][entry.address][entry.method][
        params.toString()
      ]
    );
  }

  getCachedValue(entry: Call) {
    if (this.has(entry)) {
      return this.get(entry).value.toString();
    } else {
      return undefined;
    }
  }

  get(entry: Call): CallValue | undefined {
    if (this.has(entry)) {
      const params = entry.params ? entry.params : [];
      return this.contractStorage[entry.contractType][entry.address][
        entry.method
      ][params.toString()];
    } else {
      return undefined;
    }
  }

  updateStore(entries: CallEntry[], blockNumber: number) {
    entries.forEach(entry => {
      const params = entry.params ? entry.params : [];
      if (!this.contractStorage[entry.contractType]) {
        this.contractStorage[entry.contractType] = {};
      }

      if (!this.contractStorage[entry.contractType][entry.address]) {
        this.contractStorage[entry.contractType][entry.address] = {};
      }

      if (
        !this.contractStorage[entry.contractType][entry.address][entry.method]
      ) {
        this.contractStorage[entry.contractType][entry.address][entry.method] =
          {};
      }

      if (
        !this.contractStorage[entry.contractType][entry.address][entry.method][
          params.toString()
        ]
      ) {
        this.contractStorage[entry.contractType][entry.address][entry.method][
          params.toString()
        ] = {
          value: entry.response.value,
          lastFetched: entry.response.lastFetched,
        };
      }

      const oldEntry =
        this.contractStorage[entry.contractType][entry.address][entry.method][
          params.toString()
        ];

      // Set if never fetched, or if the new data isn't stale
      if (
        !oldEntry.lastFetched ||
        (oldEntry.lastFetched && oldEntry.lastFetched <= blockNumber)
      ) {
        this.contractStorage[entry.contractType][entry.address][entry.method][
          params.toString()
        ] = {
          value: entry.response.value,
          lastFetched: entry.response.lastFetched,
        };
      }
    });
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
        multicallService,
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
          const proposalTitles = configStore.getProposalTitlesInBuild();

          Object.keys(networkCache.proposals).map(proposalId => {
            networkCache.proposals[proposalId].title =
              networkCache.proposals[proposalId].title ||
              proposalTitles[proposalId] ||
              '';
          });

          networkCache = await cacheService.getUpdatedCache(
            this.context,
            networkCache,
            networkContracts,
            fromBlock,
            toBlock,
            library
          );

          notificationStore.setGlobalLoading(true, 'Fetching token balances');
          let tokensBalancesCalls = [];
          const tokens = configStore.getTokensToFetchPrice();
          tokens.map(token => {
            if (!networkCache.daoInfo.tokenBalances[token.address])
              tokensBalancesCalls.push({
                contractType: ContractType.ERC20,
                address: token.address,
                method: 'balanceOf',
                params: [networkContracts.avatar],
              });
            Object.keys(networkCache.schemes).map(schemeAddress => {
              if (
                networkCache.schemes[schemeAddress].controllerAddress !==
                networkContracts.controller
              )
                tokensBalancesCalls.push({
                  contractType: ContractType.ERC20,
                  address: token.address,
                  method: 'balanceOf',
                  params: [schemeAddress],
                });
            });
          });

          if (tokensBalancesCalls.length > 0)
            multicallService.addCalls(tokensBalancesCalls);
          await this.executeAndUpdateMulticall(multicallService);

          tokensBalancesCalls.map(tokensBalancesCall => {
            if (tokensBalancesCall.params[0] === networkContracts.avatar) {
              networkCache.daoInfo.tokenBalances[tokensBalancesCall.address] =
                this.context.blockchainStore.getCachedValue(
                  tokensBalancesCall
                ) || bnum(0);
            } else {
              networkCache.schemes[tokensBalancesCall.params[0]].tokenBalances[
                tokensBalancesCall.address
              ] =
                this.context.blockchainStore.getCachedValue(
                  tokensBalancesCall
                ) || bnum(0);
            }
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
