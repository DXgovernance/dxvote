import RootStore from 'stores/Root';
import { BigNumber } from '../utils/bignumber';
import { decodePermission } from '../utils/permissions';
import { ContractType } from './ETHProvider';
import { action } from 'mobx';
import Web3 from 'web3';
import { bnum } from '../utils/helpers';
import { ethers, utils } from 'ethers';
import { decodeStatus } from '../utils/proposals';
import PromiEvent from 'promievent';

export interface BlockchainValue {
  value: any;
  blockNumber: Number;
}

export enum SchemeProposalState { Submitted, Passed, Failed, Executed }
export enum VotingMachineProposalState { None, ExpiredInQueue, Executed, Queued, PreBoosted, Boosted, QuietEndingPeriod}

export interface ProposalInfo {
  id: string,
  scheme: string,
  to: String[];
  callData: String[];
  values: BigNumber[];
  stateInScheme: SchemeProposalState;
  stateInVotingMachine: VotingMachineProposalState;
  descriptionHash: String;
  creationBlock: BigNumber;
  repAtCreation: BigNumber;
  winningVote: Number;
  proposer: string;
  currentBoostedVotePeriodLimit: BigNumber;
  paramsHash: string;
  daoBountyRemain: BigNumber;
  daoBounty: BigNumber;
  totalStakes: BigNumber;
  confidenceThreshold: BigNumber;
  secondsFromTimeOutTillExecuteBoosted: BigNumber;
  submittedTime: BigNumber;
  boostedPhaseTime: BigNumber;
  preBoostedPhaseTime: BigNumber;
  daoRedeemItsWinnings: boolean;
  status: string;
  statusPriority: Number;
  boostTime: Number,
  finishTime: Number,
  shouldBoost: boolean,
  positiveVotes: BigNumber;
  negativeVotes: BigNumber;
  preBoostedPositiveVotes: BigNumber;
  preBoostedNegativeVotes: BigNumber;
  positiveStakes: BigNumber;
  negativeStakes: BigNumber;
}

export interface SchemeParameters {
  queuedVoteRequiredPercentage: BigNumber;
  queuedVotePeriodLimit: BigNumber;
  boostedVotePeriodLimit: BigNumber;
  preBoostedVotePeriodLimit: BigNumber;
  thresholdConst: BigNumber;
  limitExponentValue: BigNumber;
  quietEndingPeriod: BigNumber;
  proposingRepReward: BigNumber;
  votersReputationLossRatio: BigNumber;
  minimumDaoBounty: BigNumber;
  daoBountyConst: BigNumber;
  activationTime: BigNumber;
}

export interface SchemePermissions {
  canGenericCall: boolean;
  canUpgrade: boolean;
  canChangeConstraints: boolean;
  canRegisterSchemes: boolean;
}

export interface SchemeInfo {
  address: String;
  name: String,
  parametersHash: string;
  toAddress: string;
  ethBalance: BigNumber;
  parameters: SchemeParameters;
  permissions: SchemePermissions;
  proposals: ProposalInfo[];
  proposalIds: String[];
  boostedProposals: Number;
  blockNumber: Number;
}

export interface DaoInfo {
  address: String;
  totalRep: BigNumber;
  ethBalance: BigNumber;
  blockNumber: Number;
  userRep: BigNumber;
  userVotingMachineTokenBalance: BigNumber;
  userVotingMachineTokenApproved: BigNumber;
}

export default class DaoStore {
  daoInfo: DaoInfo
  schemes: {[address: string]: SchemeInfo};
  proposals: {[id: string]: ProposalInfo};
  blockNumber: Number;
  
  rootStore: RootStore;

  constructor(rootStore) {
    this.rootStore = rootStore;
    this.daoInfo = {} as DaoInfo;
    this.schemes = {};
    this.proposals = {};
  }

  getDaoInfo(): DaoInfo {
    const { configStore, providerStore } = this.rootStore;
    const { account } = providerStore.getActiveWeb3React();
    const blockNumber = providerStore.getCurrentBlockNumber();
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
    this.daoInfo = {
      address: configStore.getAvatarAddress(),
      totalRep,
      ethBalance,
      blockNumber,
      userRep,
      userVotingMachineTokenBalance,
      userVotingMachineTokenApproved
    };
    return this.daoInfo;
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
    this.schemes[schemeAddress].proposals = proposals;
    return this.schemes[schemeAddress].proposals;
  }
  
  getSchemeInfo(schemeAddress): SchemeInfo {
    const { configStore, providerStore } = this.rootStore;
    const toAddress = this.rootStore.blockchainStore.getCachedValue({
      contractType: ContractType.WalletScheme,
      address: schemeAddress,
      method: 'toAddress',
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
    
    const blockNumber = providerStore.getCurrentBlockNumber();
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
      name: configStore.getSchemeName(schemeAddress),
      address: schemeAddress,
      toAddress,
      parametersHash,
      ethBalance,
      parameters,
      permissions,
      proposalIds,
      proposals: [],
      boostedProposals,
      blockNumber
    };
    this.schemes[schemeAddress] = schemeInfo;
    return this.schemes[schemeAddress];
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
      const { status, statusPriority, boostTime, finishTime } = decodeStatus(
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
        statusPriority: statusPriority,
        boostTime: boostTime,
        finishTime: finishTime,
        shouldBoost: proposalShouldBoost,
        positiveVotes: bnum(proposalStatusVotingMachine.split(",")[0]),
        negativeVotes: bnum(proposalStatusVotingMachine.split(",")[1]),
        preBoostedPositiveVotes: bnum(proposalStatusVotingMachine.split(",")[2]),
        preBoostedNegativeVotes: bnum(proposalStatusVotingMachine.split(",")[3]),
        positiveStakes: bnum(proposalStatusVotingMachine.split(",")[4]),
        negativeStakes: bnum(proposalStatusVotingMachine.split(",")[5])
      };
      this.proposals[proposalId] = proposalSchemeInfo;
      return this.proposals[proposalId];
    } else {
      return undefined;
    }
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
}
