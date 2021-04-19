import RootStore from 'stores';
import { BigNumber } from '../utils/bignumber';
import { decodePermission } from '../utils/permissions';
import { ContractType } from './Provider';
import { action } from 'mobx';
import Web3 from 'web3';
import { bnum } from '../utils/helpers';
import { ethers, utils } from 'ethers';
import { decodeStatus } from '../utils/proposals';
import PromiEvent from 'promievent';
import { 
  Vote,
  Stake,
  ProposalStateChange,
  Redeem,
  RedeemRep,
  ProposalInfo,
  SchemeInfo,
  DaoInfo,
  DaoCache
} from '../types';

export default class DaoStore {
  cache: DaoCache;
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    const { configStore } = this.rootStore;
    this.cache = {
      daoInfo: {} as DaoInfo,
      schemes: {},
      proposals: {},
      blockNumber: configStore.getStartBlock(),
      votes: [],
      stakes: [],
      redeems: [],
      redeemsRep: [],
      proposalStateChanges: [],
    };
  }

  getDaoInfo(): DaoInfo {
    const { configStore, providerStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    const totalRep = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getReputationAddress(),
      method: 'totalSupply',
      params: []
    });
    const userRep = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getReputationAddress(),
      method: 'balanceOf',
      params: [account]
    }) : 0;
    const ethBalance = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getMulticallAddress(),
      method: 'getEthBalance',
      params: [configStore.getAvatarAddress()]
    });
    const userEthBalance = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getMulticallAddress(),
      method: 'getEthBalance',
      params: [account]
    });
    const userVotingMachineTokenBalance = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: configStore.getVotingMachineTokenAddress(),
      method: 'balanceOf',
      params: [account]
    }) : 0;
    const  userVotingMachineTokenApproved = account ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.ERC20,
      address: configStore.getVotingMachineTokenAddress(),
      method: 'allowance',
      params: [account, configStore.getVotingMachineAddress()]
    }) : 0;
    this.cache.daoInfo = {
      address: configStore.getAvatarAddress(),
      totalRep,
      ethBalance,
      userEthBalance,
      userRep,
      userVotingMachineTokenBalance,
      userVotingMachineTokenApproved
    };
    return this.cache.daoInfo;
  }
  
  getSchemeProposals(schemeAddress): ProposalInfo[] {
    const { configStore } = this.rootStore;
    
    const proposalIds = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposals'
    }) ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposals'
    }).split(",") : undefined;

    const parametersHash = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'voteParams',
    });
    const rawParameters = (parametersHash) ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'parameters',
      params: [parametersHash]
    }) : undefined;
    
    const parameters = (rawParameters && rawParameters.length > 0) ?
      {
        queuedVoteRequiredPercentage: bnum(rawParameters.split(",")[0]),
        queuedVotePeriodLimit: bnum(rawParameters.split(",")[1]),
        boostedVotePeriodLimit: bnum(rawParameters.split(",")[2]),
        preBoostedVotePeriodLimit: bnum(rawParameters.split(",")[3]),
        thresholdConst: bnum(rawParameters.split(",")[4]),
        limitExponentValue: bnum(rawParameters.split(",")[5]),
        quietEndingPeriod: bnum(rawParameters.split(",")[6]),
        proposingRepReward: bnum(rawParameters.split(",")[7]),
        votersReputationLossRatio: bnum(rawParameters.split(",")[8]),
        minimumDaoBounty: bnum(rawParameters.split(",")[9]),
        daoBountyConst: bnum(rawParameters.split(",")[10]),
        activationTime: bnum(rawParameters.split(",")[11])
      } : undefined;
      
      let proposals = [];
      if (proposalIds && proposalIds.length > 0){
        for (let proposalIndex = proposalIds.length - 1; proposalIndex >= 0; proposalIndex --) {
          proposals.push(this.getProposalInfo(schemeAddress, proposalIds[proposalIndex], parameters));
        }
      }
    this.cache.schemes[schemeAddress].proposals = proposals;
    return this.cache.schemes[schemeAddress].proposals;
  }
  
  getSchemeInfo(schemeAddress): SchemeInfo {
    const { configStore } = this.rootStore;
    const controllerAddress = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'controllerAddress',
    });
    const ethBalance = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Multicall,
      address: configStore.getMulticallAddress(),
      method: 'getEthBalance',
      params: [schemeAddress]
    });
    const parametersHash = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'voteParams',
    });
    const proposalIds = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposals'
    }) ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposals'
    }).split(",") : undefined;
    const boostedProposals = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'orgBoostedProposalsCnt',
      params: [Web3.utils.soliditySha3(schemeAddress, configStore.getAvatarAddress())]
    })
    
    const encodedPermissions = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Controller,
      address: configStore.getControllerAddress(),
      method: 'getSchemePermissions',
      params: [schemeAddress, configStore.getAvatarAddress()]
    });
    
    const permissions = encodedPermissions ? decodePermission(encodedPermissions) : undefined;

    const rawParameters = (parametersHash) ? this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'parameters',
      params: [parametersHash]
    }) : undefined;
    
    const parameters = (rawParameters && rawParameters.length > 0) ?
      {
        queuedVoteRequiredPercentage: bnum(rawParameters.split(",")[0]),
        queuedVotePeriodLimit: bnum(rawParameters.split(",")[1]),
        boostedVotePeriodLimit: bnum(rawParameters.split(",")[2]),
        preBoostedVotePeriodLimit: bnum(rawParameters.split(",")[3]),
        thresholdConst: bnum(rawParameters.split(",")[4]),
        limitExponentValue: bnum(rawParameters.split(",")[5]),
        quietEndingPeriod: bnum(rawParameters.split(",")[6]),
        proposingRepReward: bnum(rawParameters.split(",")[7]),
        votersReputationLossRatio: bnum(rawParameters.split(",")[8]),
        minimumDaoBounty: bnum(rawParameters.split(",")[9]),
        daoBountyConst: bnum(rawParameters.split(",")[10]),
        activationTime: bnum(rawParameters.split(",")[11])
      } : undefined;
      
    const schemeInfo = {
      registered: true,
      name: configStore.getSchemeName(schemeAddress),
      address: schemeAddress,
      controllerAddress,
      parametersHash,
      ethBalance,
      parameters,
      permissions,
      proposalIds,
      proposals: [],
      boostedProposals
    };
    this.cache.schemes[schemeAddress] = schemeInfo;
    return this.cache.schemes[schemeAddress];
  }
  
  getProposalInfo(schemeAddress, proposalId, parameters): ProposalInfo {
    const { configStore } = this.rootStore;
    
    if (!parameters) {
      const parametersHash = this.rootStore.blockchainStore.getCachedValue({
        contractType: ContractType.WalletScheme,
        address: schemeAddress,
        method: 'voteParams',
      });
      const rawParameters = (parametersHash) ? this.rootStore.blockchainStore.getCachedValue({
        contractType: ContractType.VotingMachine,
        address: configStore.getVotingMachineAddress(),
        method: 'parameters',
        params: [parametersHash]
      }) : undefined;
      parameters = (rawParameters && rawParameters.length > 0) ?
        {
          queuedVoteRequiredPercentage: bnum(rawParameters.split(",")[0]),
          queuedVotePeriodLimit: bnum(rawParameters.split(",")[1]),
          boostedVotePeriodLimit: bnum(rawParameters.split(",")[2]),
          preBoostedVotePeriodLimit: bnum(rawParameters.split(",")[3]),
          thresholdConst: bnum(rawParameters.split(",")[4]),
          quietEndingPeriod: bnum(rawParameters.split(",")[5]),
          proposingRepReward: bnum(rawParameters.split(",")[6]),
          votersReputationLossRatio: bnum(rawParameters.split(",")[7]),
          minimumDaoBounty: bnum(rawParameters.split(",")[8]),
          daoBountyConst: bnum(rawParameters.split(",")[9]),
          activationTime: bnum(rawParameters.split(",")[10])
        } : undefined;
    }

    const proposalSchemeInfoRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'getOrganizationProposal',
      params:[proposalId]
    });
    
    const proposalVotingMachineInfoRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'proposals',
      params:[proposalId]
    });
    
    const proposalVotingMachineTimesRaw = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'getProposalTimes',
      params:[proposalId]
    });
    
    const proposalStatusVotingMachine = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'proposalStatusWithVotes',
      params:[proposalId]
    });
    
    const proposalShouldBoost = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.VotingMachine,
      address: configStore.getVotingMachineAddress(),
      method: 'shouldBoost',
      params:[proposalId]
    });
    
    const proposalCallbackInformation = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'proposalsInfo',
      params:[configStore.getVotingMachineAddress(), proposalId]
    });
    
    const repAtCreation = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.Reputation,
      address: configStore.getReputationAddress(),
      method: 'totalSupplyAt',
      params: [proposalCallbackInformation ? proposalCallbackInformation.split(",")[0] : 0]
    });

    let proposalSchemeInfo = undefined;
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
        parameters.queuedVotePeriodLimit,
        parameters.boostedVotePeriodLimit,
        parameters.quietEndingPeriod,
        parameters.preBoostedVotePeriodLimit,
        proposalShouldBoost
      );
        
      const pEvents = {
        votes: this.getVotes(proposalId),
        stakes: this.getStakes(proposalId),
        redeems: this.getRedeems(proposalId),
        redeemsRep: this.getRedeemsRep(proposalId),
        proposalStateChanges: this.getStateChanges(proposalId)
      }
      console.log(pEvents)
      let preBoostedVoteBlock = 999999999999;
      for (var i = 0; i < pEvents.proposalStateChanges.length; i++) {
        if (
          pEvents.proposalStateChanges[i].state == "1"
          || pEvents.proposalStateChanges[i].state == "2"
          || pEvents.proposalStateChanges[i].state == "5"
        ){
          preBoostedVoteBlock = pEvents.proposalStateChanges[i].block;
          break;
        }
      }

      let tokenRewards = {};
      let repRewards = [];
      
      if ((status == "ExpiredInQueue" || status == "Executed") && parameters.proposingRepReward > 0 ) {
        tokenRewards[votingMachineDataDivided[4]] = false;
      }
      
      for (var i = 0; i < pEvents.votes.length; i++){
        if (pEvents.votes[i].block < preBoostedVoteBlock) 
          tokenRewards[pEvents.votes[i].voter] = false;
      }
    
      for (var i = 0; i < pEvents.stakes.length; i++){
        if ((status == "ExpiredInQueue")
          || (status == "Executed") && (votingMachineDataDivided[3] == pEvents.stakes[i].vote))
          tokenRewards[pEvents.stakes[i].staker] = false;
      }
      
      for (var i = 0; i < pEvents.redeems.length; i++) {
        tokenRewards[pEvents.redeems[i].beneficiary] = true;
      }
      
      for (var i = 0; i < pEvents.redeemsRep.length; i++) {
        repRewards[pEvents.redeemsRep[i].beneficiary] = true;
      }
      
      proposalSchemeInfo = {
        id: proposalId,
        scheme: schemeAddress,
        to: proposalSchemeInfoDivided.slice(0, (proposalSchemeInfoDivided.length - 3) / 3),
        callData: proposalSchemeInfoDivided.slice((proposalSchemeInfoDivided.length - 3) / 3, (proposalSchemeInfoDivided.length - 3) / 3 * 2),
        values: proposalSchemeInfoDivided.slice((proposalSchemeInfoDivided.length - 3) / 3 * 2, proposalSchemeInfoDivided.length - 3),
        stateInScheme: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 3],
        title: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 2],
        descriptionHash: proposalSchemeInfoDivided[proposalSchemeInfoDivided.length - 1],
        creationBlock: proposalCallbackInformation.split(",")[0],
        repAtCreation: repAtCreation,
        stateInVotingMachine: votingMachineDataDivided[2],
        winningVote: votingMachineDataDivided[3],
        proposer: votingMachineDataDivided[4],
        currentBoostedVotePeriodLimit: bnum(votingMachineDataDivided[5]),
        paramsHash: votingMachineDataDivided[6],
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
        boostTime: boostTime,
        finishTime: finishTime,
        shouldBoost: proposalShouldBoost,
        positiveVotes: bnum(proposalStatusVotingMachine.split(",")[0]),
        negativeVotes: bnum(proposalStatusVotingMachine.split(",")[1]),
        preBoostedPositiveVotes: bnum(proposalStatusVotingMachine.split(",")[2]),
        preBoostedNegativeVotes: bnum(proposalStatusVotingMachine.split(",")[3]),
        positiveStakes: bnum(proposalStatusVotingMachine.split(",")[4]),
        negativeStakes: bnum(proposalStatusVotingMachine.split(",")[5]),
        tokenRewards: tokenRewards,
        repRewards: repRewards
      };
      this.cache.proposals[proposalId] = proposalSchemeInfo;
      return this.cache.proposals[proposalId];
    } else {
      return undefined;
    }
  }
  
  getVotes(proposalId: string): Vote[]{
    const { blockchainStore, configStore } = this.rootStore;

    let voteEvents = blockchainStore.getCachedEvents(
      configStore.getVotingMachineAddress(), 'VoteProposal'
    );
    voteEvents = voteEvents.filter((vote) => {return (proposalId == vote.returnValues._proposalId)});
    this.cache.votes = voteEvents.map((vote) => {
      return {
        voter: vote.returnValues._voter,
        vote: vote.returnValues._vote,
        amount: vote.returnValues._reputation,
        proposalId: vote.returnValues._proposalId,
        preBoosted: false,
        block: vote.blockNumber,
        tx: vote.transactionHash,
      }
    });
    return this.cache.votes;
  }
  
  getStakes(proposalId: string): Stake[]{
    const { blockchainStore, configStore } = this.rootStore;

    let stakeEvents = blockchainStore.getCachedEvents(
      configStore.getVotingMachineAddress(), 'Stake'
    );
    stakeEvents = stakeEvents.filter((stake) => {return (proposalId == stake.returnValues._proposalId)});

    this.cache.stakes = stakeEvents.map((stake) => {
      return {
        staker: stake.returnValues._staker,
        vote: stake.returnValues._vote,
        amount: stake.returnValues._amount,
        proposalId: stake.returnValues._proposalId,
        amount4Bounty: bnum(0),
        block: stake.blockNumber,
        tx: stake.transactionHash,
      }
    });
    return this.cache.stakes;
  }
  
  getRedeems(proposalId: string): Redeem[]{
    const { blockchainStore, configStore } = this.rootStore;

    let redeemEvents = blockchainStore.getCachedEvents(
      configStore.getVotingMachineAddress(), 'Redeem'
    );
    redeemEvents = redeemEvents.filter((redeem) => {return (proposalId == redeem.returnValues._proposalId)});

    this.cache.redeems = redeemEvents.map((stake) => {
      return {
        beneficiary: stake.returnValues._beneficiary,
        amount: stake.returnValues._amount,
        proposalId: stake.returnValues._proposalId,
        block: stake.blockNumber,
        tx: stake.transactionHash,
      }
    });
    return this.cache.redeems;
  }
  
  getRedeemsRep(proposalId: string): RedeemRep[]{
    const { blockchainStore, configStore } = this.rootStore;

    let redeemRepEvents = blockchainStore.getCachedEvents(
      configStore.getVotingMachineAddress(), 'RedeemRep'
    );
    redeemRepEvents = redeemRepEvents.filter((redeemRep) => {return (proposalId == redeemRep.returnValues._proposalId)});

    this.cache.redeemsRep = redeemRepEvents.map((redeemRep) => {
      return {
        beneficiary: redeemRep.returnValues._beneficiary,
        amount: redeemRep.returnValues._amount,
        proposalId: redeemRep.returnValues._proposalId,
        block: redeemRep.blockNumber,
        tx: redeemRep.transactionHash,
      }
    });
    return this.cache.redeemsRep;
  }
  
  getStateChanges(proposalId: string): ProposalStateChange[]{
    const { blockchainStore, configStore } = this.rootStore;

    let proposalStateChangesEvents = blockchainStore.getCachedEvents(
      configStore.getVotingMachineAddress(), 'StateChange'
    );
    proposalStateChangesEvents = proposalStateChangesEvents.filter((proposalStateChange) => {
      return (proposalId == proposalStateChange.returnValues._proposalId)
    });

    this.cache.proposalStateChanges = proposalStateChangesEvents.map((proposalStateChange) => {
      return {
        state: proposalStateChange.returnValues._proposalState,
        proposalId: proposalStateChange.returnValues._proposalId,
        block: proposalStateChange.blockNumber,
        tx: proposalStateChange.transactionHash,
      }
    });
    return this.cache.proposalStateChanges;
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
      configStore.getVotingMachineAddress(),
      'vote',
      [proposalId, decision, amount.toString(), account],
      {}
    );
  }
  
  @action approveVotingMachineToken(
  ): PromiEvent<any> {
    const { providerStore, configStore } = this.rootStore;
    return providerStore.sendTransaction(
      providerStore.getActiveWeb3React(),
      ContractType.ERC20,
      configStore.getVotingMachineTokenAddress(),
      'approve',
      [configStore.getVotingMachineAddress(), utils.bigNumberify(ethers.constants.MaxUint256)],
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
      configStore.getVotingMachineAddress(),
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
      configStore.getVotingMachineAddress(),
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
      configStore.getVotingMachineAddress(),
      'redeem',
      [proposalId, account],
      {}
    );
  }
}
