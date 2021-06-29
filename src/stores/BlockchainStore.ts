import RootStore from 'stores';
import { makeObservable, observable, action } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { isChainIdSupported } from '../provider/connectors';
import { ContractType } from './Provider';
import { decodeSchemeParameters } from '../utils/scheme';
import { decodePermission } from '../utils/permissions';
import { decodeStatus } from '../utils/proposals';
import { bnum } from '../utils/helpers';
const { updateNetworkCache } = require('../utils/cache');

export default class BlockchainStore {
  activeFetchLoop: boolean = false;
  initialLoadComplete: boolean;
  contractStorage: ContractStorage = {};
  eventsStorage: EventStorage = {};
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeObservable(this, {
        activeFetchLoop: observable,
        initialLoadComplete: observable,
        updateStore: action,
        fetchData: action
      }
    );
  }

  reduceMulticall(calls: Call[], results: any, blockNumber: number): CallEntry[] {
    const { multicallService } = this.rootStore;
    return calls.map((call, index) => {
      const value = multicallService.decodeCall(call, results[index]);
      return {
        contractType: call.contractType,
        address: call.address,
        method: call.method,
        params: call.params,
        response: {
          value: value,
          lastFetched: blockNumber
        }
      };
    });
  }
  
  async executeAndUpdateMulticall(multicallService){
    const multicallResponse = await multicallService.executeCalls();
    this.updateStore(
      this.reduceMulticall(
        multicallResponse.calls, multicallResponse.results, multicallResponse.blockNumber
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
  
  getCachedEvents(address: string, eventName: string) {
    if (this.eventsStorage[address] && this.eventsStorage[address][eventName])
      return this.eventsStorage[address][eventName].emitions;
    else
      return [];
  }

  get(entry: Call): CallValue | undefined {
    if (this.has(entry)) {
      const params = entry.params ? entry.params : [];
      return this.contractStorage[entry.contractType][entry.address][entry.method][
        params.toString()
      ];
    } else {
      return undefined;
    }
  }

  updateStore(entries: CallEntry[], blockNumber: number) {
    entries.forEach((entry) => {
      const params = entry.params ? entry.params : [];
      if (!this.contractStorage[entry.contractType]) {
        this.contractStorage[entry.contractType] = {};
      }

      if (!this.contractStorage[entry.contractType][entry.address]) {
        this.contractStorage[entry.contractType][entry.address] = {};
      }

      if (!this.contractStorage[entry.contractType][entry.address][entry.method]) {
        this.contractStorage[entry.contractType][entry.address][entry.method] = {};
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

      const oldEntry = this.contractStorage[entry.contractType][entry.address][entry.method][
        params.toString()
      ];

      // Set if never fetched, or if the new data isn't stale
      if (!oldEntry.lastFetched || (oldEntry.lastFetched && oldEntry.lastFetched <= blockNumber)) {
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
    if (!this.activeFetchLoop || reset
      && web3React
      && web3React.active
      && isChainIdSupported(web3React.chainId)
    ) {
      this.initialLoadComplete = (reset) ? false : this.initialLoadComplete;
      this.activeFetchLoop = true;
      const { library, account, chainId } = web3React;
      const {
        providerStore,
        configStore,
        multicallService,
        transactionStore,
        daoStore,
        userStore
      } = this.rootStore;

      const blockNumber = await library.eth.getBlockNumber();
      const lastCheckedBlockNumber = providerStore.getCurrentBlockNumber();

      if (blockNumber !== lastCheckedBlockNumber) {
        console.debug('[Fetch Loop] Fetch Blockchain Data', { blockNumber, account, chainId });
        
        let networkCache = daoStore.getCache();
        const fromBlock = networkCache.blockNumber + 1;
        const toBlock = blockNumber;
        const networkName = configStore.getActiveChainName();
        const networkConfig = configStore.getNetworkConfig();
        networkCache = await updateNetworkCache(networkCache, networkName, fromBlock, toBlock, library);
        
        let tokensBalancesCalls = [];
        Object.keys(networkConfig.tokens).map((tokenAddress) => {
          if (!networkCache.daoInfo.tokenBalances[tokenAddress])
            tokensBalancesCalls.push({
              contractType: ContractType.ERC20,
              address: tokenAddress,
              method: 'balanceOf',
              params: [networkConfig.avatar],
            });
          Object.keys(networkCache.schemes).map((schemeAddress) => {
            if (networkCache.schemes[schemeAddress].controllerAddress != networkConfig.controller)
              tokensBalancesCalls.push({
                contractType: ContractType.ERC20,
                address: tokenAddress,
                method: 'balanceOf',
                params: [schemeAddress],
              });
          })
        });

        if (tokensBalancesCalls.length > 0)
          multicallService.addCalls(tokensBalancesCalls);
        await this.executeAndUpdateMulticall(multicallService);
        
        tokensBalancesCalls.map((tokensBalancesCall) => {
          if (tokensBalancesCall.params[0] == networkConfig.avatar) {
            networkCache.daoInfo.tokenBalances[tokensBalancesCall.address] =
              this.rootStore.blockchainStore.getCachedValue(tokensBalancesCall) || bnum(0);
          } else {
            networkCache.schemes[tokensBalancesCall.params[0]].tokenBalances[tokensBalancesCall.address] =
              this.rootStore.blockchainStore.getCachedValue(tokensBalancesCall) || bnum(0);
          }
        });
        
        // Get user-specific blockchain data
        if (account) {
          transactionStore.checkPendingTransactions(web3React, account);
          let accountCalls = [{
            contractType: ContractType.Multicall,
            address: networkConfig.utils.multicall,
            method: 'getEthBalance',
            params: [account],
          },{
            contractType: ContractType.Reputation,
            address: networkConfig.reputation,
            method: 'balanceOf',
            params: [account],
          }];
          
          if (networkConfig.votingMachines.gen) {
            accountCalls.push({
              contractType: ContractType.ERC20,
              address: networkConfig.votingMachines.gen.token,
              method: 'balanceOf',
              params: [account],
            });
            accountCalls.push({
              contractType: ContractType.ERC20,
              address: networkConfig.votingMachines.gen.token,
              method: 'allowance',
              params: [account, networkConfig.votingMachines.gen.address],
            });
          }
          if (networkConfig.votingMachines.dxd) {
            accountCalls.push({
              contractType: ContractType.ERC20,
              address: networkConfig.votingMachines.dxd.token,
              method: 'balanceOf',
              params: [account],
            });
            accountCalls.push({
              contractType: ContractType.ERC20,
              address: networkConfig.votingMachines.dxd.token,
              method: 'allowance',
              params: [account, networkConfig.votingMachines.dxd.address],
            });
          }
          
          multicallService.addCalls(accountCalls);
          await this.executeAndUpdateMulticall(multicallService);
          userStore.update();
        };
        
        networkCache.blockNumber = toBlock;
        providerStore.setCurrentBlockNumber(toBlock);
        daoStore.updateNetworkCache(networkCache, configStore.getActiveChainName());
        
        this.initialLoadComplete = true;
        
      }
      this.activeFetchLoop = false;
    }
  }
}
