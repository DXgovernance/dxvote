import RootStore from 'stores/Root';
import { Call } from '../services/MulticallService';
import { action, observable } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { isChainIdSupported } from '../provider/connectors';
import { ContractType } from './ETHProvider';

export interface StoreEntry {
  contractType: string;
  address: string;
  method: string;
  params?: any[];
}

export interface Entry {
  contractType: string;
  address: string;
  method: string;
  params: any[];
  value: any;
  lastFetched: number;
}

export default class BlockchainStore {
  @observable activeFetchLoop: any;
  @observable initialLoadComplete: boolean;
  @observable store: object;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.store = {};
  }

  reduceMulticall(calls: Call[], results: any, blockNumber: number): Entry[] {
    const { multicallService } = this.rootStore;
    return calls.map((call, index) => {
      const value = multicallService.decodeCall(call, results[index]);
      return {
        contractType: call.contractType,
        address: call.address,
        method: call.method,
        params: call.params,
        value: value,
        lastFetched: blockNumber,
      };
    });
  }

  has(entry: StoreEntry): boolean {
    const params = entry.params ? entry.params : [];
    return (
      !!this.store[entry.contractType] &&
      !!this.store[entry.contractType][entry.address] &&
      !!this.store[entry.contractType][entry.address][entry.method] &&
      !!this.store[entry.contractType][entry.address][entry.method][
        params.toString()
      ]
    );
  }

  getCachedValue(entry: StoreEntry) {
    if (this.has(entry)) {
      return this.get(entry).value.toString();
    } else {
      return undefined;
    }
  }

  get(entry: StoreEntry): Entry | undefined {
    if (this.has(entry)) {
      const params = entry.params ? entry.params : [];
      return this.store[entry.contractType][entry.address][entry.method][
        params.toString()
      ];
    } else {
      return undefined;
    }
  }

  @action updateStore(entries: Entry[], blockNumber: number) {
    entries.forEach((entry) => {
      const params = entry.params ? entry.params : [];
      if (!this.store[entry.contractType]) {
        this.store[entry.contractType] = {};
      }

      if (!this.store[entry.contractType][entry.address]) {
        this.store[entry.contractType][entry.address] = {};
      }

      if (!this.store[entry.contractType][entry.address][entry.method]) {
        this.store[entry.contractType][entry.address][entry.method] = {};
      }

      if (
        !this.store[entry.contractType][entry.address][entry.method][
          params.toString()
        ]
      ) {
        this.store[entry.contractType][entry.address][entry.method][
          params.toString()
        ] = {};
      }

      const oldEntry = this.store[entry.contractType][entry.address][entry.method][
        params.toString()
      ];

      // Set if never fetched, or if the new data isn't stale
      if (!oldEntry.lastFetched || (oldEntry.lastFetched && oldEntry.lastFetched <= blockNumber)) {
        this.store[entry.contractType][entry.address][entry.method][
          params.toString()
        ] = {
          value: entry.value,
          lastFetched: entry.lastFetched,
        };
      }
    });
  }
    
  @action fetchData(web3React: Web3ReactContextInterface) {
    if (web3React && web3React.active && isChainIdSupported(web3React.chainId)) {
      const { library, account, chainId } = web3React;
      const {
        providerStore,
        configStore,
        multicallService,
        transactionStore,
        ipfsService
      } = this.rootStore;

      library.eth.getBlockNumber().then((blockNumber) => {
        const lastCheckedBlock = providerStore.getCurrentBlockNumber();

        if (blockNumber !== lastCheckedBlock) {
          console.debug('[Fetch Loop] Fetch Blockchain Data', { blockNumber, account, chainId });
          
          //------------------------
          // First Multicall Round
          //------------------------
          
          multicallService.addCalls([{
            contractType: ContractType.WalletScheme,
            address: configStore.getMasterWalletSchemeAddress(),
            method: 'voteParams'
          },{
            contractType: ContractType.WalletScheme,
            address: configStore.getMasterWalletSchemeAddress(),
            method: 'getOrganizationProposals'
          },{
            contractType: ContractType.WalletScheme,
            address: configStore.getQuickWalletSchemeAddress(),
            method: 'voteParams'
          },{
            contractType: ContractType.WalletScheme,
            address: configStore.getQuickWalletSchemeAddress(),
            method: 'getOrganizationProposals'
          }]);
          

          multicallService.executeCalls(
            multicallService.activeCalls,
            multicallService.activeCallsRaw
          ).then(async (response) => {
            
            const { calls, results, blockNumber } = response;
            const updates = this.reduceMulticall(calls, results, blockNumber);
            this.updateStore(updates, blockNumber);
            multicallService.resetActiveCalls();
            
            //------------------------
            // Second Multicall Round
            //------------------------
            
            // Get user-specific blockchain data
            if (account) {
              transactionStore.checkPendingTransactions(web3React, account);
              multicallService.addCalls([{
                contractType: ContractType.Multicall,
                address: configStore.getMulticallAddress(),
                method: 'getEthBalance',
                params: [account],
              },{
                contractType: ContractType.Reputation,
                address: configStore.getReputationAddress(),
                method: 'balanceOf',
                params: [account],
              },{
                contractType: ContractType.ERC20,
                address: configStore.getVotingMachineTokenAddress(),
                method: 'balanceOf',
                params: [account],
              },{
                contractType: ContractType.ERC20,
                address: configStore.getVotingMachineTokenAddress(),
                method: 'allowance',
                params: [account, configStore.getVotingMachineAddress()],
              }]);
            }

            multicallService.addCalls([{
              contractType: ContractType.Reputation,
              address: configStore.getReputationAddress(),
              method: 'totalSupplyAt',
              params: [blockNumber],
            },{
              contractType: ContractType.Multicall,
              address: configStore.getMulticallAddress(),
              method: 'getEthBalance',
              params: [configStore.getAvatarAddress()],
            },{
              contractType: ContractType.Multicall,
              address: configStore.getMulticallAddress(),
              method: 'getEthBalance',
              params: [configStore.getVotingMachineAddress()],
            },{
              contractType: ContractType.Multicall,
              address: configStore.getMulticallAddress(),
              method: 'getEthBalance',
              params: [configStore.getQuickWalletSchemeAddress()],
            },{
              contractType: ContractType.Multicall,
              address: configStore.getMulticallAddress(),
              method: 'getEthBalance',
              params: [configStore.getMasterWalletSchemeAddress()],
            },,{
              contractType: ContractType.Controller,
              address: configStore.getControllerAddress(),
              method: 'getSchemePermissions',
              params: [configStore.getQuickWalletSchemeAddress(), configStore.getAvatarAddress()],
            },{
              contractType: ContractType.Controller,
              address: configStore.getControllerAddress(),
              method: 'getSchemePermissions',
              params: [configStore.getMasterWalletSchemeAddress(), configStore.getAvatarAddress()],
            },{
              contractType: ContractType.WalletScheme,
              address: configStore.getMasterWalletSchemeAddress(),
              method: 'votingMachine',
              params: []
            },{
              contractType: ContractType.WalletScheme,
              address: configStore.getMasterWalletSchemeAddress(),
              method: 'toAddress',
              params: []
            },{
              contractType: ContractType.WalletScheme,
              address: configStore.getQuickWalletSchemeAddress(),
              method: 'votingMachine',
              params: []
            },{
              contractType: ContractType.WalletScheme,
              address: configStore.getQuickWalletSchemeAddress(),
              method: 'toAddress',
              params: []
            },{
              contractType: ContractType.VotingMachine,
              address: configStore.getVotingMachineAddress(),
              method: 'orgBoostedProposalsCnt',
              params: [library.utils.soliditySha3(configStore.getMasterWalletSchemeAddress(), configStore.getAvatarAddress())]
            },{
              contractType: ContractType.VotingMachine,
              address: configStore.getVotingMachineAddress(),
              method: 'orgBoostedProposalsCnt',
              params: [library.utils.soliditySha3(configStore.getQuickWalletSchemeAddress(), configStore.getAvatarAddress())]
            }]);
            
            const masterWalletSchemeProposalIds = this.getCachedValue({
                contractType: ContractType.WalletScheme,
                address: configStore.getMasterWalletSchemeAddress(),
                method: 'getOrganizationProposals',
            }).split(",")
            for (let pIndex = 0; pIndex < masterWalletSchemeProposalIds.length; pIndex++) {
              if (masterWalletSchemeProposalIds[pIndex] != "")
                multicallService.addCalls([{
                    contractType: ContractType.WalletScheme,
                    address: configStore.getMasterWalletSchemeAddress(),
                    method: 'getOrganizationProposal',
                    params:[masterWalletSchemeProposalIds[pIndex]]
                  },{
                    contractType: ContractType.WalletScheme,
                    address: configStore.getMasterWalletSchemeAddress(),
                    method: 'proposalsInfo',
                    params:[configStore.getVotingMachineAddress(), masterWalletSchemeProposalIds[pIndex]]
                  },{
                    contractType: ContractType.VotingMachine,
                    address: configStore.getVotingMachineAddress(),
                    method: 'proposals',
                    params:[masterWalletSchemeProposalIds[pIndex]]
                  },{
                    contractType: ContractType.VotingMachine,
                    address: configStore.getVotingMachineAddress(),
                    method: 'getProposalTimes',
                    params:[masterWalletSchemeProposalIds[pIndex]]
                  },,{
                    contractType: ContractType.VotingMachine,
                    address: configStore.getVotingMachineAddress(),
                    method: 'proposalStatusWithVotes',
                    params:[masterWalletSchemeProposalIds[pIndex]]
                  },{
                    contractType: ContractType.VotingMachine,
                    address: configStore.getVotingMachineAddress(),
                    method: 'shouldBoost',
                    params:[masterWalletSchemeProposalIds[pIndex]]
                  }]);
            }
            
            const quickWalletSchemeTotalProposalIds = this.getCachedValue({
                contractType: ContractType.WalletScheme,
                address: configStore.getQuickWalletSchemeAddress(),
                method: 'getOrganizationProposals',
            }).split(",")
            for (let pIndex = 0; pIndex < quickWalletSchemeTotalProposalIds.length; pIndex++) {
              if (quickWalletSchemeTotalProposalIds[pIndex] != "")
                multicallService.addCalls([{
                  contractType: ContractType.WalletScheme,
                  address: configStore.getQuickWalletSchemeAddress(),
                  method: 'getOrganizationProposal',
                  params:[quickWalletSchemeTotalProposalIds[pIndex]]
                },{
                  contractType: ContractType.WalletScheme,
                  address: configStore.getQuickWalletSchemeAddress(),
                  method: 'proposalsInfo',
                  params:[configStore.getVotingMachineAddress(), quickWalletSchemeTotalProposalIds[pIndex]]
                },{
                  contractType: ContractType.VotingMachine,
                  address: configStore.getVotingMachineAddress(),
                  method: 'proposals',
                  params:[quickWalletSchemeTotalProposalIds[pIndex]]
                },{
                  contractType: ContractType.VotingMachine,
                  address: configStore.getVotingMachineAddress(),
                  method: 'getProposalTimes',
                  params:[quickWalletSchemeTotalProposalIds[pIndex]]
                },{
                  contractType: ContractType.VotingMachine,
                  address: configStore.getVotingMachineAddress(),
                  method: 'proposalStatusWithVotes',
                  params:[quickWalletSchemeTotalProposalIds[pIndex]]
                },{
                  contractType: ContractType.VotingMachine,
                  address: configStore.getVotingMachineAddress(),
                  method: 'shouldBoost',
                  params:[quickWalletSchemeTotalProposalIds[pIndex]]
                }]);
            }
            
            // Get parameters information using the parameterHash from first multicall round
            const masterWalletSchemeParamHash = this.getCachedValue({
                contractType: ContractType.WalletScheme,
                address: configStore.getMasterWalletSchemeAddress(),
                method: 'voteParams',
            })
            if (masterWalletSchemeParamHash) {
              multicallService.addCalls([{
                contractType: ContractType.VotingMachine,
                address: configStore.getVotingMachineAddress(),
                method: 'parameters',
                params: [masterWalletSchemeParamHash]
              }])
            }
            const quickWalletSchemeParamHash = this.getCachedValue({
                contractType: ContractType.WalletScheme,
                address: configStore.getQuickWalletSchemeAddress(),
                method: 'voteParams',
            })
            if (quickWalletSchemeParamHash) {
              multicallService.addCalls([{
                contractType: ContractType.VotingMachine,
                address: configStore.getVotingMachineAddress(),
                method: 'parameters',
                params: [quickWalletSchemeParamHash]
              }])
            }

            multicallService.executeCalls(
              multicallService.activeCalls,
              multicallService.activeCallsRaw
            ).then(async (response) => {
              const { calls, results, blockNumber } = response;
              const updates = this.reduceMulticall(calls, results, blockNumber);
              this.updateStore(updates, blockNumber);
              
              for (let pIndex = 0; pIndex < masterWalletSchemeProposalIds.length; pIndex++) {
                const proposalInformation = this.getCachedValue({
                    contractType: ContractType.WalletScheme,
                    address: configStore.getMasterWalletSchemeAddress(),
                    method: 'getOrganizationProposal',
                    params: masterWalletSchemeProposalIds[pIndex]
                });
                if (proposalInformation && proposalInformation.split(",").length > 0)
                  ipfsService.call(proposalInformation.split(",")[proposalInformation.split(",").length -1]);
              }
              for (let pIndex = 0; pIndex < quickWalletSchemeTotalProposalIds.length; pIndex++) {
                const proposalInformation = this.getCachedValue({
                    contractType: ContractType.WalletScheme,
                    address: configStore.getQuickWalletSchemeAddress(),
                    method: 'getOrganizationProposal',
                    params: quickWalletSchemeTotalProposalIds[pIndex]
                });
                if (proposalInformation && proposalInformation.split(",").length > 0)
                  ipfsService.call(proposalInformation.split(",")[proposalInformation.split(",").length -1]);
              }
              
              if (!this.initialLoadComplete) {
                this.initialLoadComplete = true;
              }
              providerStore.setCurrentBlockNumber(blockNumber);
              multicallService.resetActiveCalls();
              
            })
            .catch((e) => {
              // TODO: Retry on failure, unless stale.
              console.error(e);
            });
          })
          .catch((e) => {
            // TODO: Retry on failure, unless stale.
            console.error(e);
          });
        }
      }).catch((error) => {
        console.error('[Fetch Loop Failure]', {
          web3React,
          providerStore,
          chainId,
          account,
          library,
          error,
        });
        providerStore.setCurrentBlockNumber(undefined);
      });
    }
  }
}
