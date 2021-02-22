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
  @observable activeFetchLoop: boolean = false;
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
  
  async fetchSchemeData(schemeType: string, schemeName: string, web3React: Web3ReactContextInterface) {
    if (web3React && web3React.active && isChainIdSupported(web3React.chainId)) {
      const { library } = web3React;
      const {
        configStore,
        multicallService,
        ipfsService
      } = this.rootStore;
      const schemeContract = ContractType[schemeType];
      const schemeAddress = configStore.getSchemeAddress(schemeName);

      // First multicall round to get scheme base info and proposals ids
      multicallService.addCalls([{
        contractType: schemeContract,
        address: schemeAddress,
        method: 'voteParams'
      },{
        contractType: schemeContract,
        address: schemeAddress,
        method: 'getOrganizationProposals'
      },{
        contractType: ContractType.Multicall,
        address: configStore.getMulticallAddress(),
        method: 'getEthBalance',
        params: [schemeAddress],
      },{
        contractType: ContractType.Controller,
        address: configStore.getControllerAddress(),
        method: 'getSchemePermissions',
        params: [schemeAddress, configStore.getAvatarAddress()],
      },{
        contractType: schemeContract,
        address: schemeAddress,
        method: 'votingMachine',
        params: []
      },{
        contractType: schemeContract,
        address: schemeAddress,
        method: 'toAddress',
        params: []
      },{
        contractType: ContractType.VotingMachine,
        address: configStore.getVotingMachineAddress(),
        method: 'orgBoostedProposalsCnt',
        params: [library.utils.soliditySha3(schemeAddress, configStore.getAvatarAddress())]
      }]);
      await this.executeAndUpdateMulticall(multicallService);
      
      // Second round to get proposals information with proposals ids
      const schemeProposalIds = this.getCachedValue({
        contractType: schemeContract,
        address: schemeAddress,
        method: 'getOrganizationProposals',
      }).split(",")
      for (let pIndex = 0; pIndex < schemeProposalIds.length; pIndex++) {
        if (schemeProposalIds[pIndex] != "")
          multicallService.addCalls([{
            contractType: schemeContract,
            address: schemeAddress,
            method: 'getOrganizationProposal',
            params:[schemeProposalIds[pIndex]]
          },{
            contractType: schemeContract,
            address: schemeAddress,
            method: 'proposalsInfo',
            params:[configStore.getVotingMachineAddress(), schemeProposalIds[pIndex]]
          },{
            contractType: ContractType.VotingMachine,
            address: configStore.getVotingMachineAddress(),
            method: 'proposals',
            params:[schemeProposalIds[pIndex]]
          },{
            contractType: ContractType.VotingMachine,
            address: configStore.getVotingMachineAddress(),
            method: 'getProposalTimes',
            params:[schemeProposalIds[pIndex]]
          },,{
            contractType: ContractType.VotingMachine,
            address: configStore.getVotingMachineAddress(),
            method: 'proposalStatusWithVotes',
            params:[schemeProposalIds[pIndex]]
          },{
            contractType: ContractType.VotingMachine,
            address: configStore.getVotingMachineAddress(),
            method: 'shouldBoost',
            params:[schemeProposalIds[pIndex]]
          }]);
      }
    
      // Get parameters information using the parameterHash from first multicall round
      const schemeParamHash = this.getCachedValue({
          contractType: ContractType.WalletScheme,
          address: schemeAddress,
          method: 'voteParams',
      })
      if (schemeParamHash) {
        multicallService.addCalls([{
          contractType: ContractType.VotingMachine,
          address: configStore.getVotingMachineAddress(),
          method: 'parameters',
          params: [schemeParamHash]
        }])
      }
      await this.executeAndUpdateMulticall(multicallService);

      // Third multicall round to get the ipfs description content and rep supply at at proposal creation
      for (let pIndex = 0; pIndex < schemeProposalIds.length; pIndex++) {
        const proposalInformation = this.getCachedValue({
            contractType: schemeContract,
            address: schemeAddress,
            method: 'getOrganizationProposal',
            params: schemeProposalIds[pIndex]
        });
        if (proposalInformation && proposalInformation.split(",").length > 0)
          ipfsService.call(proposalInformation.split(",")[proposalInformation.split(",").length -1]);
          
        const proposalCallBackInformation = this.getCachedValue({
            contractType: schemeContract,
            address: schemeAddress,
            method: 'proposalsInfo',
            params: [configStore.getVotingMachineAddress(), schemeProposalIds[pIndex]]
        });
        multicallService.addCalls([{
          contractType: ContractType.Reputation,
          address: configStore.getReputationAddress(),
          method: 'totalSupplyAt',
          params: [proposalCallBackInformation.split(',')[0]]
        }])
      }
      await this.executeAndUpdateMulticall(multicallService);
    }
  }
    
  @action async fetchData(web3React: Web3ReactContextInterface) {
    if (!this.activeFetchLoop && web3React && web3React.active && isChainIdSupported(web3React.chainId)) {
      this.activeFetchLoop = true;
      const { library, account, chainId } = web3React;
      const {
        providerStore,
        configStore,
        multicallService,
        transactionStore
      } = this.rootStore;

      const blockNumber = library.eth.getBlockNumber();
      const lastCheckedBlockNumber = providerStore.getCurrentBlockNumber();

      if (blockNumber !== lastCheckedBlockNumber) {
        console.debug('[Fetch Loop] Fetch Blockchain Data', { blockNumber, account, chainId });
        
        await this.fetchSchemeData('WalletScheme', 'masterWallet', web3React);
        await this.fetchSchemeData('WalletScheme', 'quickWallet', web3React);
        
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
          method: 'totalSupply',
          params: [],
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
        }]);
        
        await this.executeAndUpdateMulticall(multicallService);
        this.initialLoadComplete = true;
        providerStore.setCurrentBlockNumber(blockNumber);
        
      }
      this.activeFetchLoop = false;
    }
  }
}
