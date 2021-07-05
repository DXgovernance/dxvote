import RootStore from 'stores';
import { BigNumber } from '../utils/bignumber';
import { ContractType } from './Provider';
import { action } from 'mobx';
import web3 from 'web3';
import _ from 'lodash';
import { bnum } from '../utils/helpers';
import { decodeProposalStatus } from '../utils/proposals';
import { ethers, utils } from 'ethers';
import PromiEvent from 'promievent';
import {
  VoteDecision,
  WalletSchemeProposalState,
  VotingMachineProposalState
} from '../enums';

const CACHE = require('../cache');

export default class DaoStore {
  daoCache: DaoCache = CACHE;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  
  // Parse bignnumbers
  parseCache(unparsedCache: DaoNetworkCache): DaoNetworkCache {
    unparsedCache.daoInfo.totalRep = bnum(unparsedCache.daoInfo.totalRep);
    unparsedCache.daoInfo.ethBalance = bnum(unparsedCache.daoInfo.ethBalance);
    unparsedCache.daoInfo.repEvents.map((repEvent, i) => {
      unparsedCache.daoInfo.repEvents[i].amount = bnum(repEvent.amount)
    })
    Object.keys(unparsedCache.schemes).map((schemeAddress) => {
      unparsedCache.schemes[schemeAddress].ethBalance = bnum(unparsedCache.schemes[schemeAddress].ethBalance)
    })
    Object.keys(unparsedCache.callPermissions).map((callPermissionFrom) => {
      unparsedCache.callPermissions[callPermissionFrom].map((callPermission, i) => {
        unparsedCache.callPermissions[callPermissionFrom][i].fromTime = bnum(callPermission.fromTime)
        unparsedCache.callPermissions[callPermissionFrom][i].value = bnum(callPermission.value)
      })
    })
    Object.keys(unparsedCache.proposals).map((proposalId) => {
      unparsedCache.proposals[proposalId].values = unparsedCache.proposals[proposalId].values.map((value) => {
        return bnum(value);
      })

      unparsedCache.proposals[proposalId].stateInScheme = unparsedCache.proposals[proposalId].stateInScheme;
      unparsedCache.proposals[proposalId].stateInVotingMachine = unparsedCache.proposals[proposalId].stateInVotingMachine;
      unparsedCache.proposals[proposalId].repAtCreation = bnum(unparsedCache.proposals[proposalId].repAtCreation);
      unparsedCache.proposals[proposalId].currentBoostedVotePeriodLimit = bnum(unparsedCache.proposals[proposalId].currentBoostedVotePeriodLimit);
      unparsedCache.proposals[proposalId].daoBountyRemain = bnum(unparsedCache.proposals[proposalId].daoBountyRemain);
      unparsedCache.proposals[proposalId].daoBounty = bnum(unparsedCache.proposals[proposalId].daoBounty);
      unparsedCache.proposals[proposalId].totalStakes = bnum(unparsedCache.proposals[proposalId].totalStakes);
      unparsedCache.proposals[proposalId].confidenceThreshold = bnum(unparsedCache.proposals[proposalId].confidenceThreshold);
      unparsedCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted = bnum(unparsedCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted);
      unparsedCache.proposals[proposalId].submittedTime = bnum(unparsedCache.proposals[proposalId].submittedTime);
      unparsedCache.proposals[proposalId].preBoostedPhaseTime = bnum(unparsedCache.proposals[proposalId].preBoostedPhaseTime);
      unparsedCache.proposals[proposalId].boostedPhaseTime = bnum(unparsedCache.proposals[proposalId].boostedPhaseTime);
      unparsedCache.proposals[proposalId].positiveVotes = bnum(unparsedCache.proposals[proposalId].positiveVotes);
      unparsedCache.proposals[proposalId].negativeVotes = bnum(unparsedCache.proposals[proposalId].negativeVotes);
      unparsedCache.proposals[proposalId].preBoostedPositiveVotes = bnum(unparsedCache.proposals[proposalId].preBoostedPositiveVotes);
      unparsedCache.proposals[proposalId].preBoostedNegativeVotes = bnum(unparsedCache.proposals[proposalId].preBoostedNegativeVotes);
      unparsedCache.proposals[proposalId].positiveStakes = bnum(unparsedCache.proposals[proposalId].positiveStakes);
      unparsedCache.proposals[proposalId].negativeStakes = bnum(unparsedCache.proposals[proposalId].negativeStakes);
    });
    
    Object.keys(unparsedCache.votingMachines).map((votingMachineAddress) => {
      Object.keys(unparsedCache.votingMachines[votingMachineAddress].votingParameters)
        .map((paramsHash) => {
          const unparsedParams = unparsedCache.votingMachines[votingMachineAddress].votingParameters[paramsHash];
        unparsedCache.votingMachines[votingMachineAddress].votingParameters[paramsHash] = {
          queuedVoteRequiredPercentage: bnum(unparsedParams.queuedVoteRequiredPercentage),
          queuedVotePeriodLimit: bnum(unparsedParams.queuedVotePeriodLimit),
          boostedVotePeriodLimit: bnum(unparsedParams.boostedVotePeriodLimit),
          preBoostedVotePeriodLimit: bnum(unparsedParams.preBoostedVotePeriodLimit),
          thresholdConst: bnum(unparsedParams.thresholdConst),
          limitExponentValue: bnum(unparsedParams.limitExponentValue),
          quietEndingPeriod: bnum(unparsedParams.quietEndingPeriod),
          proposingRepReward: bnum(unparsedParams.proposingRepReward),
          votersReputationLossRatio: bnum(unparsedParams.votersReputationLossRatio),
          minimumDaoBounty: bnum(unparsedParams.minimumDaoBounty),
          daoBountyConst: bnum(unparsedParams.daoBountyConst),
          activationTime: bnum(unparsedParams.activationTime)
        };
      })
    })
    return unparsedCache;
  }
  
  getCache(): DaoNetworkCache {
    return this.daoCache[this.rootStore.configStore.getActiveChainName()];
  }
  
  updateNetworkCache(newNetworkCache: DaoNetworkCache, networkName: string) {
    this.daoCache[networkName] = this.parseCache(newNetworkCache);
    console.debug('Cache Updated]', this.daoCache[networkName]);
  }

  getDaoInfo(): DaoInfo {
    return this.getCache().daoInfo;
  }
  
  getSchemeProposalsByName(_schemeName: string): Proposal[] {
    let schemeAddress;
    for (const _schemeAddress in this.getCache().schemes) {
      if (this.getCache().schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let proposals = [];
    for (const proposalId in this.getCache().proposals) {
      if (this.getCache().proposals[proposalId].scheme === schemeAddress) {
        proposals.push(this.getProposal(proposalId));
      }
    }
    return proposals;
  }
  
  getSchemeByName(_schemeName: string): Scheme {
    let schemeAddress;
    for (const _schemeAddress in this.getCache().schemes) {
      if (this.getCache().schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let schemeInfo;
    for (const _schemeAddress in this.getCache().schemes) {
      if (this.getCache().schemes[_schemeAddress].name === _schemeName) {
        schemeInfo = this.getCache().schemes[schemeAddress];
        break;
      }
    }
    return schemeInfo;
  }
  
  getSchemeProposals(_schemeName: string): Proposal[] {
    let schemeAddress;
    for (const _schemeAddress in this.getCache().schemes) {
      if (this.getCache().schemes[_schemeAddress].name === _schemeName) {
        schemeAddress = _schemeAddress;
      }
    }
    let proposals = [];
    for (const proposalId in this.getCache().proposals) {
      if (this.getCache().proposals[proposalId].scheme === schemeAddress) {
        proposals.push(this.getProposal(proposalId));
      }
    }
    return proposals;
  }
  
  getGovernanceInfo(): any {
    let users = {},
    totalPositiveVotes = 0,
    totalPositiveVotesAmount = bnum(0),
    totalNegativeVotes = 0,
    totalNegativeVotesAmount = bnum(0),
    totalPositiveStakes = 0,
    totalPositiveStakesAmount = bnum(0),
    totalNegativeStakes = 0,
    totalNegativeStakesAmount = bnum(0),
    totalProposalsCreated = 0;
    const cache = this.getCache();
    let rep = [];
    Object.keys(cache.users).map((userAddress) => {
      if (cache.users[userAddress].repBalance > 0)
        rep.push([userAddress, bnum(cache.users[userAddress].repBalance).div(10**18).toNumber()])
    })
    rep = _.sortBy(rep, [function(o) { return o[1]; }]);
    rep.unshift(["User Address", "REP %"]);
    
    let repEvents = [];
    let repTotalSupply = bnum(0);
    let blockNumber = 0;
    for (let i = 0; i < cache.daoInfo.repEvents.length; i++) {

      if (cache.daoInfo.repEvents[i].event == "Mint")
        repTotalSupply = repTotalSupply.plus(cache.daoInfo.repEvents[i].amount);
      else if (cache.daoInfo.repEvents[i].event == "Burn")
        repTotalSupply = repTotalSupply.minus(cache.daoInfo.repEvents[i].amount);
      
      if (cache.daoInfo.repEvents[i].l1BlockNumber > blockNumber){
        blockNumber = cache.daoInfo.repEvents[i].l1BlockNumber;
        repEvents.push([blockNumber, bnum(repTotalSupply).div(10**18).toNumber()])
      }
    }
    repEvents.unshift(["Block", "Total Rep"]);

    Object.keys(cache.votingMachines).map((votingMachineAddress) => {
      cache.votingMachines[votingMachineAddress].events.votes.map((vote) => {
        if (!users[vote.voter])
          users[vote.voter] = {
            correctVotes: 0, wrongVotes:0,
            correctStakes: 0, wrongStakes: 0,
            proposals: 0, totalVoted: bnum(0), totalStaked: bnum(0), score: 0
          };
        
        if (!cache.proposals[vote.proposalId]) {
          console.debug("MISSING PROPOSAL", vote.proposalId);
        } else {
          if (vote.vote == 1){
            totalPositiveVotes ++;
            totalPositiveVotesAmount = totalPositiveVotesAmount.plus(bnum(vote.amount));
          } else {
            totalNegativeVotes ++;
            totalNegativeVotesAmount = totalNegativeVotesAmount.plus(bnum(vote.amount));
          }
          if (cache.proposals[vote.proposalId].winningVote == vote.vote){
            users[vote.voter].correctVotes ++;
            users[vote.voter].totalVoted = users[vote.voter].totalVoted.plus(bnum(vote.amount));
            users[vote.voter].score += 3;
            
          } else {
            users[vote.voter].wrongVotes ++;
            users[vote.voter].totalVoted = users[vote.voter].totalVoted.plus(bnum(vote.amount));
            users[vote.voter].score += 1;
          }
        }
      })
      cache.votingMachines[votingMachineAddress].events.stakes.map((stake) => {
        if (!users[stake.staker])
          users[stake.staker] = {
            correctVotes: 0, wrongVotes:0,
            correctStakes: 0, wrongStakes: 0,
            proposals: 0, totalVoted: bnum(0), totalStaked: bnum(0), score: 0
          };
        
        if (!cache.proposals[stake.proposalId]) {
          console.debug("MISSING PROPOSAL", stake.proposalId);
        } else {
          if (stake.vote == 1){
            totalPositiveStakes ++;
            totalPositiveStakesAmount = totalPositiveStakesAmount.plus(bnum(stake.amount));
          } else {
            totalNegativeStakes ++;
            totalNegativeStakesAmount = totalNegativeStakesAmount.plus(bnum(stake.amount));
          }
          
          if (cache.proposals[stake.proposalId].winningVote == stake.vote){
            users[stake.staker].correctStakes ++;
            users[stake.staker].totalStaked = users[stake.staker].totalStaked.plus(bnum(stake.amount));
            users[stake.staker].score += 1;
          } else {
            users[stake.staker].wrongStakes ++;
            users[stake.staker].totalStaked = users[stake.staker].totalStaked.plus(bnum(stake.amount));
          }
        }
      });
    })


    Object.keys(cache.proposals).map( (proposalId) => {
      
      const proposalCreator = cache.proposals[proposalId].proposer;
      
      if (proposalCreator != "0x0000000000000000000000000000000000000000") {
        if (!users[proposalCreator])
          users[proposalCreator] = {
            correctVotes: 0, wrongVotes:0,
            correctStakes: 0, wrongStakes: 0,
            proposals: 0, totalVoted: bnum(0), totalStaked: bnum(0), score: 0
          };
          
        const score = cache.proposals[proposalId].positiveVotes.plus(cache.proposals[proposalId].negativeVotes)
          .div(cache.proposals[proposalId].repAtCreation).div("0.20").times("10").toFixed(2);
        users[proposalCreator].score += Math.min(Math.min(score, 1), 30);
        users[proposalCreator].proposals ++;
      } else {
        console.debug(
          "Couldnt get proposer for proposal", proposalId, "in scheme",
          cache.schemes[cache.proposals[proposalId].scheme].name,
          "in transaction", cache.proposals[proposalId].creationEvent.tx
        )
      }
      totalProposalsCreated ++;

    });
    
    return {
      totalPositiveVotes,
      totalPositiveVotesAmount,
      totalNegativeVotes,
      totalNegativeVotesAmount,
      totalPositiveStakes,
      totalPositiveStakesAmount,
      totalNegativeStakes,
      totalNegativeStakesAmount,
      totalProposalsCreated,
      rep,
      repEvents,
      ranking: _.orderBy(
        Object.keys(users).map(key => ( Object.assign({ address: key }, users[key]) )), ["score"], ["desc"]
      )
    }
  }
  
  getAllProposals(): Proposal[] {
    const allProposals = Object.keys(this.getCache().proposals)
      .map( (proposalId) => {return this.getCache().proposals[proposalId] } );
    return _.orderBy(
      allProposals ,
      ["creationEvent.l1BlockNumber", "creationEvent.l2BlockNumber", "creationEvent.transactionIndex", "creationEvent.logIndex"],
      ["asc","asc","asc","asc"]
    );
  }
  
  getAllSchemes(): Scheme[] {
    const schemeAddresses = Object.keys(this.getCache().schemes);
    return schemeAddresses.map( (schemeAddress) => {return this.getCache().schemes[schemeAddress] } );
  }
  
  getProposal(proposalId): Proposal {
    return this.getCache().proposals[proposalId];
  }
  
  getScheme(schemeAddress): Scheme {
    return this.getCache().schemes[schemeAddress];
  }
  
  getVotingMachineOfProposal(proposalId): String {
    return this.getCache().schemes[
      this.getCache().proposals[proposalId].scheme
    ].votingMachine;
  }
  
  getVotingParametersOfProposal(proposalId): VotingMachineParameters {
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)].votingParameters[
      this.getCache().proposals[proposalId].paramsHash
    ];
  }
  
  getVotingParametersOfScheme(schemeAddress): VotingMachineParameters {
    const scheme = this.getCache().schemes[schemeAddress];
    return this.getCache().votingMachines[scheme.votingMachine].votingParameters[ scheme.paramsHash ];
  }
  
  getProposalEvents(proposalId): {
    votes: Vote[],
    stakes: Stake[],
    redeems: Redeem[],
    redeemsRep: RedeemRep[],
    stateChanges: ProposalStateChange[],
    history: {
      text: string,
      event: ProposalEvent
    }[]
  }{
    const proposalEvents = {
      votes: this.getVotesOfProposal(proposalId),
      stakes: this.getStakesOfProposal(proposalId),
      redeems: this.getRedeemsOfProposal(proposalId),
      redeemsRep: this.getRedeemsRepOfProposal(proposalId),
      stateChanges: this.getProposalStateChanges(proposalId)
    }
    
    const proposal = this.getProposal(proposalId);
      
    let history : {
      text: string,
      event: ProposalEvent
    }[] = proposalEvents.votes.map((event) => {
      return {
        text: `Vote from ${event.voter} of ${(bnum(event.amount)).times('100').div(proposal.repAtCreation).toFixed(4)} % REP on decision ${VoteDecision[event.vote]}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    }).concat(proposalEvents.stakes.map((event) => {
      return {
        text: `Stake from ${event.staker} of ${web3.utils.fromWei(event.amount).toString()} DXD on decision ${VoteDecision[event.vote]}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.redeems.map((event) => {
      return {
        text: `DXD Redeem from ${event.beneficiary} of ${event.amount}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.redeemsRep.map((event) => {
      return {
        text: `REP Redeem from ${event.beneficiary} of ${event.amount}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.stateChanges.map((event) => {
      return {
        text: `Proposal change to state ${VotingMachineProposalState[event.state]}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    }))
    history.push({
      text: `Proposal created by ${proposal.proposer}`,
      event: proposal.creationEvent
    });
    
    history = _.orderBy( history, ["event.timestamp", "event.logIndex"], ["asc","asc"] );
    
    return {
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      stateChanges: proposalEvents.stateChanges,
      history: history
    }
  }
  
  getUser(userAddress): {
    repBalance: BigNumber,
    repPercentage: Number
  } {
    const user = this.getCache().users[userAddress];

    return {
      repBalance: user ? bnum(user.repBalance) : bnum(0),
      repPercentage: user && user.repBalance ? bnum(user.repBalance).times('100').div(this.getCache().daoInfo.totalRep).toNumber() : 0
    }
  }
  
  getUserEvents(userAddress): {
    votes: Vote[],
    stakes: Stake[],
    redeems: Redeem[],
    redeemsRep: RedeemRep[],
    newProposal: ProposalEvent[],
    history: {
      text: string,
      event: ProposalEvent
    }[]
  }{
    
    let history : {
      text: string,
      event: ProposalEvent
    } = [];
    
    const cache = this.getCache();
    const votingMachines = this.rootStore.configStore.getNetworkConfig().votingMachines;
    let proposalEvents = {
      votes: [],
      stakes: [],
      redeems: [],
      redeemsRep: []
    };
    if (votingMachines.gen) {
      proposalEvents.votes = proposalEvents.votes.concat(cache.votingMachines[votingMachines.gen.address].events.votes
        .filter((vote) => {return (userAddress === vote.voter)}));
      proposalEvents.stakes = proposalEvents.stakes.concat(cache.votingMachines[votingMachines.gen.address].events.stakes
        .filter((stake) => {return (userAddress === stake.staker)}));
      proposalEvents.redeems = proposalEvents.redeems.concat(cache.votingMachines[votingMachines.gen.address].events.redeems
        .filter((redeem) => {return (userAddress === redeem.beneficiary)}));
      proposalEvents.redeemsRep = proposalEvents.redeemsRep.concat(cache.votingMachines[votingMachines.gen.address].events.redeemsRep
        .filter((redeemRep) => {return (userAddress === redeemRep.beneficiary)}));
    }

    if (votingMachines.dxd) {
      proposalEvents.votes = proposalEvents.votes.concat(cache.votingMachines[votingMachines.dxd.address].events.votes
        .filter((vote) => {return (userAddress === vote.voter)}));
      proposalEvents.stakes = proposalEvents.stakes.concat(cache.votingMachines[votingMachines.dxd.address].events.stakes
        .filter((stake) => {return (userAddress === stake.staker)}));
      proposalEvents.redeems = proposalEvents.redeems.concat(cache.votingMachines[votingMachines.dxd.address].events.redeems
        .filter((redeem) => {return (userAddress === redeem.beneficiary)}));
      proposalEvents.redeemsRep = proposalEvents.redeemsRep.concat(cache.votingMachines[votingMachines.dxd.address].events.redeemsRep
        .filter((redeemRep) => {return (userAddress === redeemRep.beneficiary)}));
    }
    
    const newProposalEvents = cache.users[userAddress]
      ? cache.users[userAddress].proposalsCreated.map((proposalId) => {
        history.push({
          text: `Proposal ${proposalId} created`,
          event: {
            proposalId: cache.proposals[proposalId].creationEvent.proposalId,
            tx: cache.proposals[proposalId].creationEvent.tx,
            block: cache.proposals[proposalId].creationEvent.block,
            transactionIndex: cache.proposals[proposalId].creationEvent.transactionIndex,
            logIndex: cache.proposals[proposalId].creationEvent.logIndex,
            timestamp: cache.proposals[proposalId].creationEvent.timestamp
          }
        })
        return cache.proposals[proposalId].creationEvent;
      })
      : [];

    history = history.concat(proposalEvents.votes.map((event) => {
      return {
        text: `Voted with ${event.amount} REP for decision ${VoteDecision[event.vote]} on proposal ${event.proposalId}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.stakes.map((event) => {
      return {
        text: `Staked ${event.amount} DXD for decision ${VoteDecision[event.vote]} on proposal ${event.proposalId}`,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.redeems.map((event) => {
      return {
        text: `DXD amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    })).concat(proposalEvents.redeemsRep.map((event) => {
      return {
        text: `REP amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
        event: {
          proposalId: event.proposalId,
          tx: event.tx,
          block: event.l1BlockNumber,
          transactionIndex: event.transactionIndex,
          logIndex: event.logIndex,
          timestamp: event.timestamp
        }
      }
    }))
    history = _.orderBy( history, ["event.timestamp", "event.logIndex"], ["asc","asc"] );
    
    return {
      newProposalEvents: newProposalEvents,
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      history: history
    }
  }
  
  getProposalStatus(proposalId: string): any {
    const proposal = this.getCache().proposals[proposalId];
    const proposalStateChangeEvents = this.getProposalStateChanges(proposalId);
    const scheme = this.getCache().schemes[proposal.scheme];
    const votingMachineParams = 
    (proposal.paramsHash == "0x0000000000000000000000000000000000000000000000000000000000000000")
    ? this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .votingParameters[scheme.paramsHash]
    : this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .votingParameters[proposal.paramsHash];
    
    console.log(proposal,this.getCache().schemes[proposal.scheme].paramsHash)
    return decodeProposalStatus(proposal, proposalStateChangeEvents, votingMachineParams, scheme.maxSecondsForExecution);
  }
  
  getVotesOfProposal(proposalId: string): Vote[]{
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .events.votes
      .filter((vote) => {return (proposalId === vote.proposalId)});
  }
  
  getStakesOfProposal(proposalId: string): Stake[]{
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .events.stakes
      .filter((stake) => {return (proposalId === stake.proposalId)});
  }
  
  getRedeemsOfProposal(proposalId: string): Redeem[]{
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .events.redeems
      .filter((redeem) => {return (proposalId === redeem.proposalId)});
  }
  
  getRedeemsRepOfProposal(proposalId: string): RedeemRep[]{
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .events.redeemsRep
      .filter((redeemRep) => {return (proposalId === redeemRep.proposalId)});
  }
  
  getProposalStateChanges(proposalId: string): ProposalStateChange[]{
    return this.getCache().votingMachines[this.getVotingMachineOfProposal(proposalId)]
      .events.proposalStateChanges
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
      this.getVotingMachineOfProposal(proposalId),
      'vote',
      [proposalId, decision, amount.toString(), account],
      {}
    );
  }
  
  @action approveVotingMachineToken(votingMachineAddress): PromiEvent<any> {
    const { providerStore, configStore, blockchainStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      this.getCache().votingMachines[votingMachineAddress].token.address,
      'approve',
      [votingMachineAddress, utils.bigNumberify(ethers.constants.MaxUint256)],
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
      this.getVotingMachineOfProposal(proposalId),
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
      this.getVotingMachineOfProposal(proposalId),
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
      this.getVotingMachineOfProposal(proposalId),
      'redeem',
      [proposalId, account],
      {}
    );
  }
}
