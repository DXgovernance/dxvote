import RootStore from 'stores';
import { BigNumber } from '../utils/bignumber';
import { ContractType } from './Provider';
import { action } from 'mobx';
import _ from 'lodash';
import { bnum } from '../utils/helpers';
import { ethers, utils } from 'ethers';
import PromiEvent from 'promievent';
import { 
  Vote,
  Stake,
  ProposalStateChange,
  Redeem,
  RedeemRep,
  Proposal,
  Scheme,
  DaoInfo,
  DaoNetworkCache,
  VotingMachineEvent
} from '../types';

const CACHE = require('../cache.json');

export default class DaoStore {
  cache: DaoNetworkCache;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    if (this.rootStore.configStore.getActiveChainName() !== 'none')
      this.cache = this.getLocalCache(this.rootStore.configStore.getActiveChainName());
  }
  
  getLatestCacheBlock() {
    return this.cache.blockNumber;
  }
  
  // Get the local cache file and parse the bignumbers
  getLocalCache(networkName: string): DaoNetworkCache {
    const localCache : DaoNetworkCache = CACHE[networkName];
    localCache.daoInfo.totalRep = bnum(localCache.daoInfo.totalRep);
    localCache.daoInfo.ethBalance = bnum(localCache.daoInfo.ethBalance);
    localCache.daoInfo.dxdBalance = bnum(localCache.daoInfo.dxdBalance);
    Object.keys(localCache.daoInfo.repHolders).map((repHolder) => {
      localCache.daoInfo.repHolders[repHolder] = bnum(localCache.daoInfo.repHolders[repHolder])
    })
    localCache.daoInfo.repEvents.map((repEvent, i) => {
      localCache.daoInfo.repEvents[i].amount = bnum(repEvent.amount)
    })
    Object.keys(localCache.schemes).map((schemeAddress) => {
      localCache.schemes[schemeAddress].ethBalance = bnum(localCache.schemes[schemeAddress].ethBalance)
      localCache.schemes[schemeAddress].parameters = {
        queuedVoteRequiredPercentage: bnum(localCache.schemes[schemeAddress].parameters.queuedVoteRequiredPercentage),
        queuedVotePeriodLimit: bnum(localCache.schemes[schemeAddress].parameters.queuedVotePeriodLimit),
        boostedVotePeriodLimit: bnum(localCache.schemes[schemeAddress].parameters.boostedVotePeriodLimit),
        preBoostedVotePeriodLimit: bnum(localCache.schemes[schemeAddress].parameters.preBoostedVotePeriodLimit),
        thresholdConst: bnum(localCache.schemes[schemeAddress].parameters.thresholdConst),
        limitExponentValue: bnum(localCache.schemes[schemeAddress].parameters.limitExponentValue),
        quietEndingPeriod: bnum(localCache.schemes[schemeAddress].parameters.quietEndingPeriod),
        proposingRepReward: bnum(localCache.schemes[schemeAddress].parameters.proposingRepReward),
        votersReputationLossRatio: bnum(localCache.schemes[schemeAddress].parameters.votersReputationLossRatio),
        minimumDaoBounty: bnum(localCache.schemes[schemeAddress].parameters.minimumDaoBounty),
        daoBountyConst: bnum(localCache.schemes[schemeAddress].parameters.daoBountyConst),
        activationTime: bnum(localCache.schemes[schemeAddress].parameters.activationTime)
      }
    })
    Object.keys(localCache.callPermissions).map((callPermissionFrom) => {
      localCache.callPermissions[callPermissionFrom].map((callPermission, i) => {
        localCache.callPermissions[callPermissionFrom][i].fromTime = bnum(callPermission.fromTime)
        localCache.callPermissions[callPermissionFrom][i].value = bnum(callPermission.value)
        
      })
    })
    Object.keys(localCache.proposals).map((proposalId) => {
      localCache.proposals[proposalId].values = localCache.proposals[proposalId].values.map((value) => {
        return bnum(value);
      })
      localCache.proposals[proposalId].creationBlock = bnum(localCache.proposals[proposalId].creationBlock);
      localCache.proposals[proposalId].repAtCreation = bnum(localCache.proposals[proposalId].repAtCreation);
      localCache.proposals[proposalId].currentBoostedVotePeriodLimit = bnum(localCache.proposals[proposalId].currentBoostedVotePeriodLimit);
      localCache.proposals[proposalId].daoBountyRemain = bnum(localCache.proposals[proposalId].daoBountyRemain);
      localCache.proposals[proposalId].daoBounty = bnum(localCache.proposals[proposalId].daoBounty);
      localCache.proposals[proposalId].totalStakes = bnum(localCache.proposals[proposalId].totalStakes);
      localCache.proposals[proposalId].confidenceThreshold = bnum(localCache.proposals[proposalId].confidenceThreshold);
      localCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted = bnum(localCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted);
      localCache.proposals[proposalId].submittedTime = bnum(localCache.proposals[proposalId].submittedTime);
      localCache.proposals[proposalId].boostedPhaseTime = bnum(localCache.proposals[proposalId].boostedPhaseTime);
      localCache.proposals[proposalId].boostTime = bnum(localCache.proposals[proposalId].boostTime);
      localCache.proposals[proposalId].finishTime = bnum(localCache.proposals[proposalId].finishTime);
      localCache.proposals[proposalId].positiveVotes = bnum(localCache.proposals[proposalId].positiveVotes);
      localCache.proposals[proposalId].negativeVotes = bnum(localCache.proposals[proposalId].negativeVotes);
      localCache.proposals[proposalId].preBoostedPositiveVotes = bnum(localCache.proposals[proposalId].preBoostedPositiveVotes);
      localCache.proposals[proposalId].preBoostedNegativeVotes = bnum(localCache.proposals[proposalId].preBoostedNegativeVotes);
      localCache.proposals[proposalId].positiveStakes = bnum(localCache.proposals[proposalId].positiveStakes);
      localCache.proposals[proposalId].negativeStakes = bnum(localCache.proposals[proposalId].negativeStakes);
    })
    return localCache;
  }
  
  getCache(): DaoNetworkCache {
    if (!this.cache)
      this.cache = this.getLocalCache(this.rootStore.configStore.getActiveChainName());
    return this.cache;
  }
  
  updateCache(newCache: DaoNetworkCache) {
    this.cache = newCache;;
  }

  getDaoInfo(): DaoInfo {
    const { configStore } = this.rootStore;

    const totalRep = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getNetworkConfig().reputation,
      method: 'totalSupply',
      params: []
    });
    
    const ethBalance = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getNetworkConfig().multicall,
      method: 'getEthBalance',
      params: [configStore.getNetworkConfig().avatar]
    });
  
    this.cache.daoInfo.address = configStore.getNetworkConfig().avatar;
    this.cache.daoInfo.totalRep = totalRep;
    this.cache.daoInfo.ethBalance = ethBalance;
    return this.cache.daoInfo;
  }
  
  getSchemeProposalsByName(_schemeName: string): Proposal[] {
    let schemeAddress;
    for (const _schemeAddress in this.cache.schemes) {
      if (this.cache.schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let proposals = [];
    for (const proposalId in this.cache.proposals) {
      if (this.cache.proposals[proposalId].scheme === schemeAddress) {
        proposals.push(this.getProposal(proposalId));
      }
    }
    return proposals;
  }
  
  getSchemeByName(_schemeName: string): Scheme {
    let schemeAddress;
    for (const _schemeAddress in this.cache.schemes) {
      if (this.cache.schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let schemeInfo;
    for (const _schemeAddress in this.cache.schemes) {
      if (this.cache.schemes[_schemeAddress].name === _schemeName) {
        schemeInfo = this.cache.schemes[schemeAddress];
        break;
      }
    }
    return schemeInfo;
  }
  
  getSchemeProposals(_schemeName: string): Proposal[] {
    let schemeAddress;
    for (const _schemeAddress in this.cache.schemes) {
      if (this.cache.schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let proposals = [];
    for (const proposalId in this.cache.proposals) {
      if (this.cache.proposals[proposalId].scheme === schemeAddress) {
        proposals.push(this.getProposal(proposalId));
      }
    }
    return proposals;
  }
  
  getAllProposals(): Proposal[] {
    const proposalsIds = Object.keys(this.cache.proposals);
    return proposalsIds.map( (proposalId) => {return this.cache.proposals[proposalId] } );
  }
  
  getAllSchemes(): Scheme[] {
    const schemeAddresses = Object.keys(this.cache.schemes);
    return schemeAddresses.map( (schemeAddress) => {return this.cache.schemes[schemeAddress] } );
  }
  
  getProposal(proposalId): Proposal{
    return this.cache.proposals[proposalId];
  }
  
  getScheme(schemeAddress): Scheme{
    return this.cache.schemes[schemeAddress];
  }
  
  getProposalEvents(proposalId): {
    votes: Vote[]
    stakes: Stake[]
    redeems: Redeem[]
    redeemsRep: RedeemRep[]
    stateChanges: ProposalStateChange[],
    history: {
      text: string,
      event: VotingMachineEvent
    }[]
  }{
    const proposalEvents = {
      votes: this.getVotesOfProposal(proposalId),
      stakes: this.getStakesOfProposal(proposalId),
      redeems: this.getRedeemsOfProposal(proposalId),
      redeemsRep: this.getRedeemsRepOfProposal(proposalId),
      stateChanges: this.getProposalStateChanges(proposalId)
    }
    
    let history : {
      text: string,
      event: VotingMachineEvent
    }[] = proposalEvents.votes.map((event) => {
      return {
        text: `Vote from ${event.voter} on decision ${event.vote}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    }).concat(proposalEvents.stakes.map((event) => {
      return {
        text: `Stake from ${event.staker} on decision ${event.vote}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    })).concat(proposalEvents.redeems.map((event) => {
      return {
        text: `DXD Redeem from ${event.beneficiary} of ${event.amount}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    })).concat(proposalEvents.redeemsRep.map((event) => {
      return {
        text: `REP Redeem from ${event.beneficiary} of ${event.amount}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    })).concat(proposalEvents.stateChanges.map((event) => {
      return {
        text: `Proposal change to state ${event.state}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    }))
    history = _.orderBy(
      history,
      ["event.blockNumber", "event.transactionIndex", "event.logIndex"],
      ["asc","asc","asc"]
    );
    
    return {
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      stateChanges: proposalEvents.stateChanges,
      history: _.reverse(history)
    }
  }
  
  getUserRep(userAddress): {
    amount: BigNumber,
    percentage: Number
  } {
    const daoInfo = this.cache.daoInfo;
    return {
      amount: daoInfo.repHolders[userAddress] || bnum(0),
      percentage: daoInfo.repHolders[userAddress] ? daoInfo.repHolders[userAddress].div(daoInfo.totalRep).times('100').toNumber() : 0
    }
  }
  
  getUserEvents(userAddress): {
    votes: Vote[]
    stakes: Stake[]
    redeems: Redeem[]
    redeemsRep: RedeemRep[]
    history: {
      text: string,
      event: VotingMachineEvent
    }[]
  }{
    const proposalEvents = {
      votes: this.cache.votingMachineEvents.votes
        .filter((vote) => {return (userAddress === vote.voter)}),
      stakes: this.cache.votingMachineEvents.stakes
        .filter((stake) => {return (userAddress === stake.staker)}),
      redeems: this.cache.votingMachineEvents.redeems
        .filter((redeem) => {return (userAddress === redeem.beneficiary)}),
      redeemsRep: this.cache.votingMachineEvents.redeemsRep
        .filter((redeemRep) => {return (userAddress === redeemRep.beneficiary)})
    }
    
    let history : {
      text: string,
      event: VotingMachineEvent
    }[] = proposalEvents.votes.map((event) => {
      return {
        text: `Voted with ${event.amount} REP for decision ${event.vote} on proposal ${event.proposalId}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    }).concat(proposalEvents.stakes.map((event) => {
      return {
        text: `Staked ${event.amount} DXD for decision ${event.vote} on proposal ${event.proposalId}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    })).concat(proposalEvents.redeems.map((event) => {
      return {
        text: `DXD amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    })).concat(proposalEvents.redeemsRep.map((event) => {
      return {
        text: `REP amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.block,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex
        }
      }
    }))
    history = _.orderBy(
      history,
      ["event.blockNumber", "event.transactionIndex", "event.logIndex"],
      ["asc","asc","asc"]
    );
    
    return {
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      history: _.reverse(history)
    }
  }
  
  getVotesOfProposal(proposalId: string): Vote[]{
    return this.cache.votingMachineEvents.votes
      .filter((vote) => {return (proposalId === vote.proposalId)});
  }
  
  getStakesOfProposal(proposalId: string): Stake[]{
    return this.cache.votingMachineEvents.stakes
      .filter((stake) => {return (proposalId === stake.proposalId)});

  }
  
  getRedeemsOfProposal(proposalId: string): Redeem[]{
    return this.cache.votingMachineEvents.redeems
      .filter((redeem) => {return (proposalId === redeem.proposalId)});
  }
  
  getRedeemsRepOfProposal(proposalId: string): RedeemRep[]{
    return this.cache.votingMachineEvents.redeemsRep
      .filter((redeemRep) => {return (proposalId === redeemRep.proposalId)});
  }
  
  getProposalStateChanges(proposalId: string): ProposalStateChange[]{
    return this.cache.votingMachineEvents.proposalStateChanges
      .filter((proposalStateChange) => {return (proposalId === proposalStateChange.proposalId)});
  }

  @action createProposal(
    scheme: string,
    to: String[],
    callData: String[],
    values: BigNumber[],
    title: String,
    descriptionHash: String,
  ): PromiEvent<any> {
    const { providerStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.WalletScheme,
      scheme,
      'proposeCalls',
      [to, callData, values, title, descriptionHash],
      {}
    );
  }
  
  @action vote(
    decision: Number,
    amount: Number,
    proposalId: String,
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getNetworkConfig().votingMachine,
      'vote',
      [proposalId, decision, amount.toString(), account],
      {}
    );
  }
  
  @action approveVotingMachineToken(
  ): PromiEvent<any> {
    const { providerStore, configStore, blockchainStore } = this.rootStore;
    const votingMachineToken = blockchainStore.getCachedValue({
        contractType: ContractType.VotingMachine,
        address: configStore.getNetworkConfig().votingMachine,
        method: 'stakingToken',
    })
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      votingMachineToken,
      'approve',
      [configStore.getNetworkConfig().votingMachine, utils.bigNumberify(ethers.constants.MaxUint256)],
      {}
    );
  }
  
  @action stake(
    decision: Number,
    amount: Number,
    proposalId: String,
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getNetworkConfig().votingMachine,
      'stake',
      [proposalId, decision, amount.toString()],
      {}
    );
  }
  
  @action execute(
    proposalId: String,
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getNetworkConfig().votingMachine,
      'execute',
      [proposalId],
      {}
    );
  }
  
  @action redeem(
    proposalId: String, account: string
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.VotingMachine,
      configStore.getNetworkConfig().votingMachine,
      'redeem',
      [proposalId, account],
      {}
    );
  }
}
