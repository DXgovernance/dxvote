import RootStore from 'stores';
import { makeObservable, observable, action } from 'mobx';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { isChainIdSupported } from '../provider/connectors';
import { ContractType } from './Provider';
import { Call, CallValue, CallEntry, EventStorage, ContractStorage, DaoNetworkCache } from '../types';
import { decodeSchemeParameters } from '../utils/scheme';
import { decodePermission } from '../utils/permissions';
import { decodeStatus } from '../utils/proposals';
import { bnum } from '../utils/helpers';

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
  
  async fetchSchemeData(schemeAddress: string) {
    const {
      configStore,
      multicallService,
      ipfsService,
      providerStore
    } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    const schemeContract = ContractType.WalletScheme;

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
      address: configStore.getNetworkConfig().multicall,
      method: 'getEthBalance',
      params: [schemeAddress],
    },{
      contractType: ContractType.Controller,
      address: configStore.getNetworkConfig().controller,
      method: 'getSchemePermissions',
      params: [schemeAddress, configStore.getNetworkConfig().avatar],
    },{
      contractType: schemeContract,
      address: schemeAddress,
      method: 'votingMachine',
      params: []
    },{
      contractType: schemeContract,
      address: schemeAddress,
      method: 'controllerAddress',
      params: []
    },{
      contractType: schemeContract,
      address: schemeAddress,
      method: 'schemeName',
      params: []
    },{
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'orgBoostedProposalsCnt',
      params: [library.utils.soliditySha3(schemeAddress, configStore.getNetworkConfig().avatar)]
    },{
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'maxSecondsForExecution',
      params: []
    }]);
    await this.executeAndUpdateMulticall(multicallService);
    
    // Second round to get proposals information with proposals ids
    const schemeProposalIds = this.getCachedValue({
      contractType: schemeContract,
      address: schemeAddress,
      method: 'getOrganizationProposals',
    }).split(",");
    
    for (let pIndex = 0; pIndex < schemeProposalIds.length; pIndex++) {
      if (schemeProposalIds[pIndex] !== "")
        multicallService.addCalls([{
          contractType: schemeContract,
          address: schemeAddress,
          method: 'getOrganizationProposal',
          params:[schemeProposalIds[pIndex]]
        },{
          contractType: schemeContract,
          address: schemeAddress,
          method: 'proposalsInfo',
          params:[configStore.getNetworkConfig().votingMachine, schemeProposalIds[pIndex]]
        },{
          contractType: ContractType.VotingMachine,
          address: configStore.getNetworkConfig().votingMachine,
          method: 'proposals',
          params:[schemeProposalIds[pIndex]]
        },{
          contractType: ContractType.VotingMachine,
          address: configStore.getNetworkConfig().votingMachine,
          method: 'getProposalTimes',
          params:[schemeProposalIds[pIndex]]
        },{
          contractType: ContractType.VotingMachine,
          address: configStore.getNetworkConfig().votingMachine,
          method: 'proposalStatusWithVotes',
          params:[schemeProposalIds[pIndex]]
        },{
          contractType: ContractType.VotingMachine,
          address: configStore.getNetworkConfig().votingMachine,
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
        address: configStore.getNetworkConfig().votingMachine,
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
        ipfsService.call(proposalInformation.split(",")[proposalInformation.split(",").length -2]);
        
      const proposalCallBackInformation = this.getCachedValue({
          contractType: schemeContract,
          address: schemeAddress,
          method: 'proposalsInfo',
          params: [configStore.getNetworkConfig().votingMachine, schemeProposalIds[pIndex]]
      });
      if (proposalCallBackInformation)
        multicallService.addCalls([{
          contractType: ContractType.Reputation,
          address: configStore.getNetworkConfig().reputation,
          method: 'totalSupplyAt',
          params: [proposalCallBackInformation.split(',')[0]]
        }])
    }
    await this.executeAndUpdateMulticall(multicallService);
  }
  
  updateSchemeData(cacheToUpdate: DaoNetworkCache, schemeAddress: string): DaoNetworkCache {
    const { configStore, providerStore } = this.rootStore;
    const { library } = providerStore.getActiveWeb3React();
    
    const ethBalance = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getNetworkConfig().multicall,
      method: 'getEthBalance',
      params: [schemeAddress]
    });

    let proposalIds = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposals',
      params: []
    });
    
    if (proposalIds.indexOf(',') > 0)
      proposalIds = proposalIds.split(',');
    else
      proposalIds = [proposalIds];
      
    const boostedProposals = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'orgBoostedProposalsCnt',
      params: [library.utils.soliditySha3(schemeAddress, configStore.getNetworkConfig().avatar)]
    })
    
    const maxSecondsForExecution = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'maxSecondsForExecution',
      params: []
    })
    
    cacheToUpdate.schemes[schemeAddress].ethBalance = ethBalance;
    cacheToUpdate.schemes[schemeAddress].proposalIds = proposalIds;
    cacheToUpdate.schemes[schemeAddress].boostedProposals = boostedProposals;
    cacheToUpdate.schemes[schemeAddress].maxSecondsForExecution = maxSecondsForExecution;
    
    return cacheToUpdate;
  }
  
  updateProposalData(cacheToUpdate: DaoNetworkCache, schemeAddress: string, proposalId: string): DaoNetworkCache {
    const { configStore } = this.rootStore;
    const proposalSchemeInfoRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposal',
      params:[proposalId]
    });
    
    const proposalVotingMachineInfoRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'proposals',
      params:[proposalId]
    });
    
    const proposalVotingMachineTimesRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'getProposalTimes',
      params:[proposalId]
    });
    
    const proposalStatusVotingMachine = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'proposalStatusWithVotes',
      params:[proposalId]
    });
    
    const proposalShouldBoost = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getNetworkConfig().votingMachine,
      method: 'shouldBoost',
      params:[proposalId]
    });
    
    const proposalCallbackInformation = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'proposalsInfo',
      params:[configStore.getNetworkConfig().votingMachine, proposalId]
    });
    
    const repAtCreation = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getNetworkConfig().reputation,
      method: 'totalSupplyAt',
      params: [proposalCallbackInformation ? proposalCallbackInformation.split(",")[0] : 0]
    });

    if (
      proposalSchemeInfoRaw && proposalSchemeInfoRaw.length > 0
      && proposalVotingMachineInfoRaw && proposalVotingMachineInfoRaw.length > 0
      && proposalStatusVotingMachine && proposalStatusVotingMachine.length > 0
      && proposalShouldBoost && proposalShouldBoost.length > 0
    ) {
      
      const proposalSchemeInfoDivided = proposalSchemeInfoRaw.split(",")
      const votingMachineDataDivided = proposalVotingMachineInfoRaw.split(",")
      const votingMachineTimesDivided = proposalVotingMachineTimesRaw.split(",")
      const { status, priority, boostTime, finishTime } = decodeStatus(
        votingMachineDataDivided[2],
        proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 3],
        bnum(votingMachineTimesDivided[0]),
        bnum(votingMachineTimesDivided[1]),
        bnum(votingMachineTimesDivided[2]),
        cacheToUpdate.schemes[schemeAddress].parameters.queuedVotePeriodLimit,
        cacheToUpdate.schemes[schemeAddress].parameters.boostedVotePeriodLimit,
        cacheToUpdate.schemes[schemeAddress].parameters.quietEndingPeriod,
        cacheToUpdate.schemes[schemeAddress].parameters.preBoostedVotePeriodLimit,
        proposalShouldBoost
      );
      let proposalValues = proposalSchemeInfoDivided.slice((proposalSchemeInfoDivided.length - 3) / 3 * 2, proposalSchemeInfoDivided.length - 3);

      const proposalSchemeInfo = {
        id: proposalId,
        scheme: schemeAddress,
        to: proposalSchemeInfoDivided.slice(0, (proposalSchemeInfoDivided.length - 4) / 3),
        callData: proposalSchemeInfoDivided.slice((proposalSchemeInfoDivided.length - 4) / 3, (proposalSchemeInfoDivided.length - 4) / 3 * 2),
        values: proposalValues.map((value) => {return bnum(value)}),
        stateInScheme: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 4],
        title: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 3],
        descriptionHash: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 2],
        creationBlock: proposalCallbackInformation.split(",")[0],
        repAtCreation: bnum(repAtCreation),
        stateInVotingMachine: votingMachineDataDivided[2],
        winningVote: votingMachineDataDivided[3],
        proposer: votingMachineDataDivided[4],
        currentBoostedVotePeriodLimit: bnum(votingMachineDataDivided[5]),
        daoBountyRemain: bnum(votingMachineDataDivided[7]),
        daoBounty: bnum(votingMachineDataDivided[8]),
        totalStakes: bnum(votingMachineDataDivided[9]),
        confidenceThreshold: bnum(votingMachineDataDivided[10]),
        secondsFromTimeOutTillExecuteBoosted: bnum(votingMachineDataDivided[11]),
        daoRedeemItsWinnings: votingMachineDataDivided[12],
        submittedTime: bnum(votingMachineTimesDivided[0]),
        boostedPhaseTime: bnum(votingMachineTimesDivided[1]),
        preBoostedPhaseTime: bnum(votingMachineTimesDivided[2]),
        status: status,
        priority: priority,
        boostTime: bnum(boostTime),
        finishTime: bnum(finishTime),
        shouldBoost: proposalShouldBoost,
        positiveVotes: bnum(proposalStatusVotingMachine.split(",")[0]),
        negativeVotes: bnum(proposalStatusVotingMachine.split(",")[1]),
        preBoostedPositiveVotes: bnum(proposalStatusVotingMachine.split(",")[2]),
        preBoostedNegativeVotes: bnum(proposalStatusVotingMachine.split(",")[3]),
        positiveStakes: bnum(proposalStatusVotingMachine.split(",")[4]),
        negativeStakes: bnum(proposalStatusVotingMachine.split(",")[5])
      };
      cacheToUpdate.proposals[proposalId] = proposalSchemeInfo;
    }
    return cacheToUpdate;
  }
  
  async getUpdatedCacheToBlock(toBlock: number): Promise<DaoNetworkCache> {
    const { eventsService, configStore, daoStore, providerStore } = this.rootStore;
    
    let cache = daoStore.getCache();
    
    const fromBlock = cache.blockNumber;
    eventsService.addEventsCalls([
      { contractType: ContractType.Controller,
        address: configStore.getNetworkConfig().controller,
        eventName: "allEvents",
        fromBlock: fromBlock,
        toBlock: toBlock 
      },
      { contractType: ContractType.VotingMachine,
        address: configStore.getNetworkConfig().votingMachine,
        eventName: "allEvents",
        fromBlock: fromBlock,
        toBlock: toBlock 
      },
      { contractType: ContractType.PermissionRegistry,
        address: configStore.getNetworkConfig().permissionRegistry,
        eventName: "allEvents",
        fromBlock: fromBlock,
        toBlock: toBlock 
      },
      { contractType: ContractType.Reputation,
        address: configStore.getNetworkConfig().reputation,
        eventName: "allEvents",
        fromBlock: fromBlock,
        toBlock: toBlock 
      }
    ]);
    
    const [
      controllerEvents,
      votingMachineEvents,
      permissionRegistryEvents,
      reputationEvents
    ] = await eventsService.executeActiveEventCalls();
    eventsService.resetActiveEventCalls()
    // Get all call permissions (up to date) to later be added in schemes
    permissionRegistryEvents.map((permissionRegistryEvent) => {
      const eventValues = permissionRegistryEvent.returnValues;
      
      if (!cache.callPermissions[eventValues.from])
        cache.callPermissions[eventValues.from] = [];
      
      if (eventValues.value !== 0 && eventValues.fromTime !== 0) {
        cache.callPermissions[eventValues.from].push({
          asset: eventValues.asset,
          to: eventValues.to,
          functionSignature: eventValues.functionSignature,
          value: eventValues.value,
          fromTime: eventValues.fromTime
        })
      } else {
        const permissionIndex = cache.callPermissions[eventValues.from].findIndex(i => i.asset === eventValues.asset && i.to === eventValues.to);
        cache.callPermissions[eventValues.from].splice(permissionIndex, 1);
      }
      
    });
    
    // Get all schemes and their information in registerScheme events in controller
    await Promise.all(controllerEvents.map(async (controllerEvent) => {
      
      // Add or update the scheme information, register scheme is used to add and updates scheme parametersHash
      if (controllerEvent.event === "RegisterScheme" && !cache.schemes[controllerEvent.returnValues._scheme]) {
        const { library } = providerStore.getActiveWeb3React();
        const schemeContract = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.WalletScheme,
          controllerEvent.returnValues._scheme
        )
        const votingMachine = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.VotingMachine,
          configStore.getNetworkConfig().votingMachine
        )
        const controller = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.Controller,
          configStore.getNetworkConfig().controller
        )
        const paramsHash = await schemeContract.voteParams.call();
        const controllerAddress = await schemeContract.controllerAddress.call();
        
        cache.schemes[schemeContract.address] = {
          registered: true,
          address: schemeContract.address,
          name: await schemeContract.schemeName.call(),
          paramsHash: paramsHash,
          controllerAddress: controllerAddress,
          ethBalance: await library.eth.getBalance(schemeContract.address),
          
          // Get and decode the full parameters from the voting machine using teh parametersHash
          parameters: decodeSchemeParameters(
            await votingMachine.parameters.call(paramsHash)
          ),
          
          // Get and decode the permissions
          permissions: decodePermission(
            await controller.getSchemePermissions.call(controllerEvent.returnValues._scheme, configStore.getNetworkConfig().avatar)
          ),
          
          proposalIds: [],
          boostedProposals: await votingMachine.orgBoostedProposalsCnt.call(
            library.utils.soliditySha3(schemeContract.address, configStore.getNetworkConfig().avatar)
          ),
          maxSecondsForExecution: await schemeContract.maxSecondsForExecution.call()
        };
      
      // If scheme parameters and permissions are updated
    } else if (controllerEvent.event === "RegisterScheme" && cache.schemes[controllerEvent.returnValues._scheme]) {
        const schemeContract = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.WalletScheme,
          controllerEvent.returnValues._scheme
        )
        const votingMachine = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.VotingMachine,
          configStore.getNetworkConfig().votingMachine
        )
        const controller = providerStore.getContract(
          providerStore.getActiveWeb3React(),
          ContractType.Controller,
          configStore.getNetworkConfig().controller
        )
        const paramsHash = await schemeContract.voteParams.call();
        cache.schemes[schemeContract.address].paramsHash = paramsHash;
        cache.schemes[schemeContract.address].parameters = decodeSchemeParameters(
          await votingMachine.parameters.call(paramsHash)
        );
        cache.schemes[schemeContract.address].permissions = decodePermission(
          await controller.getSchemePermissions.call(controllerEvent.returnValues._scheme, configStore.getNetworkConfig().avatar)
        );
      // Mark scheme as not registered but save all previous data
      } else if (
        controllerEvent.event === "UnregisterScheme" && 
        // This condition is added to skip the first scheme added (that is the dao creator account)
        (controllerEvent.returnValues._sender !== controllerEvent.returnValues._scheme)
        
      ) {
        cache.schemes[controllerEvent.returnValues._scheme].registered = false;
        await this.fetchSchemeData(controllerEvent.returnValues._scheme);
      }
      
    }));
    
    // Get all votes, stakes, redeems and redeems rep form voting machine events
    votingMachineEvents.map((votingMachineEvent) => {
      switch (votingMachineEvent.event) {
        case "StateChange":
          cache.votingMachineEvents.proposalStateChanges.push({
            state: votingMachineEvent.returnValues._proposalState,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            block: votingMachineEvent.blockNumber,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "VoteProposal":
          
          const preBoosted = cache.votingMachineEvents.proposalStateChanges
            .findIndex(i => i.state === "5") >= 0;

          cache.votingMachineEvents.votes.push({
            voter: votingMachineEvent.returnValues._voter,
            vote: votingMachineEvent.returnValues._vote,
            amount: votingMachineEvent.returnValues._reputation,
            preBoosted: preBoosted,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            block: votingMachineEvent.blockNumber,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "Stake":
        cache.votingMachineEvents.stakes.push({
            staker: votingMachineEvent.returnValues._staker,    
            vote: votingMachineEvent.returnValues._vote,
            amount: votingMachineEvent.returnValues._amount,
            amount4Bounty: bnum("0"),
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            block: votingMachineEvent.blockNumber,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "Redeem":
          cache.votingMachineEvents.redeems.push({
            beneficiary: votingMachineEvent.returnValues._beneficiary,
            amount: votingMachineEvent.returnValues._amount,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            block: votingMachineEvent.blockNumber,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
        case "RedeemRep":
          cache.votingMachineEvents.redeemsRep.push({
            beneficiary: votingMachineEvent.returnValues._beneficiary,
            amount: votingMachineEvent.returnValues._amount,
            proposalId: votingMachineEvent.returnValues._proposalId,
            tx: votingMachineEvent.transactionHash,
            block: votingMachineEvent.blockNumber,
            transactionIndex: votingMachineEvent.transactionIndex,
            logIndex: votingMachineEvent.logIndex
          });
        break;
      }
    });
    
    // Store all the rep holders balances up to date
    reputationEvents.map((reputationEvent) => {
      switch (reputationEvent.event) {
        case "Mint":
          cache.daoInfo.repEvents.push({
            type: "Mint",
            account: reputationEvent.returnValues._to,
            amount: bnum(reputationEvent.returnValues._amount),
            tx: reputationEvent.transactionHash,
            block: reputationEvent.blockNumber,
            transactionIndex: reputationEvent.transactionIndex,
            logIndex: reputationEvent.logIndex
          });
          cache.daoInfo.repHolders[reputationEvent.returnValues._to] = 
            !cache.daoInfo.repHolders[reputationEvent.returnValues._to]
              ? bnum(reputationEvent.returnValues._amount)
              : bnum(cache.daoInfo.repHolders[reputationEvent.returnValues._to]).plus(reputationEvent.returnValues._amount)
        break;
        case "Burn":
          cache.daoInfo.repEvents.push({
            type: "Burn",
            account: reputationEvent.returnValues._from,
            amount: bnum(reputationEvent.returnValues._amount),
            tx: reputationEvent.transactionHash,
            block: reputationEvent.blockNumber,
            transactionIndex: reputationEvent.transactionIndex,
            logIndex: reputationEvent.logIndex
          });
          cache.daoInfo.repHolders[reputationEvent.returnValues._from] =
            bnum(cache.daoInfo.repHolders[reputationEvent.returnValues._from]).minus(reputationEvent.returnValues._amount)
        break;
      }
    })
    
    for (const schemeAddress in cache.schemes) {
      if (cache.schemes[schemeAddress].registered) {
        await this.fetchSchemeData(schemeAddress);
      }
      cache = this.updateSchemeData(cache, schemeAddress);
      for (let i = 0; i < cache.schemes[schemeAddress].proposalIds.length; i++) {
        if (cache.schemes[schemeAddress].proposalIds[i])
          cache = this.updateProposalData(cache, schemeAddress, cache.schemes[schemeAddress].proposalIds[i]);
      }
    }
    
    return cache;
  }
    
  async fetchData(web3React: Web3ReactContextInterface) {
    if (!this.activeFetchLoop && web3React && web3React.active && isChainIdSupported(web3React.chainId)) {
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
        
        let newCache = await this.getUpdatedCacheToBlock(blockNumber);
        
        multicallService.addCalls([{
          contractType: ContractType.VotingMachine,
          address: configStore.getNetworkConfig().votingMachine,
          method: 'stakingToken',
          params: [],
        }])

        await this.executeAndUpdateMulticall(multicallService);
        
        const votingMachineToken = this.getCachedValue({
            contractType: ContractType.VotingMachine,
            address: configStore.getNetworkConfig().votingMachine,
            method: 'stakingToken',
        })
        
        // Get user-specific blockchain data
        if (account) {
          transactionStore.checkPendingTransactions(web3React, account);
          multicallService.addCalls([{
            contractType: ContractType.Multicall,
            address: configStore.getNetworkConfig().multicall,
            method: 'getEthBalance',
            params: [account],
          },{
            contractType: ContractType.Reputation,
            address: configStore.getNetworkConfig().reputation,
            method: 'balanceOf',
            params: [account],
          },{
            contractType: ContractType.ERC20,
            address: votingMachineToken,
            method: 'balanceOf',
            params: [account],
          },{
            contractType: ContractType.ERC20,
            address: votingMachineToken,
            method: 'allowance',
            params: [account, configStore.getNetworkConfig().votingMachine],
          }]);
        }

        multicallService.addCalls([{
          contractType: ContractType.Reputation,
          address: configStore.getNetworkConfig().reputation,
          method: 'totalSupply',
          params: [],
        },{
          contractType: ContractType.Multicall,
          address: configStore.getNetworkConfig().multicall,
          method: 'getEthBalance',
          params: [configStore.getNetworkConfig().avatar],
        },{
          contractType: ContractType.ERC20,
          address: votingMachineToken,
          method: 'balanceOf',
          params: [configStore.getNetworkConfig().avatar],
        },{
          contractType: ContractType.Multicall,
          address: configStore.getNetworkConfig().multicall,
          method: 'getEthBalance',
          params: [configStore.getNetworkConfig().votingMachine],
        }]);
        
        await this.executeAndUpdateMulticall(multicallService);
        userStore.update();

        newCache.daoInfo.totalRep = this.rootStore.blockchainStore.getCachedValue({
          contractType: ContractType.Reputation,
          address: configStore.getNetworkConfig().reputation,
          method: 'totalSupply',
          params: []
        })
        
        newCache.daoInfo.ethBalance = this.rootStore.blockchainStore.getCachedValue({
          contractType: ContractType.Reputation,
          address: configStore.getNetworkConfig().multicall,
          method: 'getEthBalance',
          params: [configStore.getNetworkConfig().avatar]
        })
        
        newCache.daoInfo.dxdBalance = this.rootStore.blockchainStore.getCachedValue({
          contractType: ContractType.ERC20,
          address: votingMachineToken,
          method: 'balanceOf',
          params: [configStore.getNetworkConfig().avatar]
        });
        
        newCache.blockNumber = blockNumber;
        providerStore.setCurrentBlockNumber(blockNumber);
        daoStore.updateCache(newCache);
        
        this.initialLoadComplete = true;
        
      }
      this.activeFetchLoop = false;
    }
  }
}
