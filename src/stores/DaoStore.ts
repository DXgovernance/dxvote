import RootContext from '../contexts';
import { action, makeObservable } from 'mobx';
import _ from 'lodash';
import {
  BigNumber,
  ZERO_ADDRESS,
  ANY_ADDRESS,
  ANY_FUNC_SIGNATURE,
  MAX_UINT,
  bnum,
  decodeProposalStatus,
  VoteDecision,
  VotingMachineProposalState,
  normalizeBalance,
  formatPercentage,
  hasLostReputation,
  isExpired,
  isNotActive,
  isWinningVote,
  votedBeforeBoosted,
} from '../utils';
import { TokenVesting } from '../types/types';

export default class DaoStore {
  daoCache: DaoNetworkCache;
  context: RootContext;

  constructor(context) {
    this.context = context;

    makeObservable(this, {
      setCache: action,
      reset: action,
    });
  }

  reset() {
    this.daoCache = undefined;
  }

  // Parse bignnumbers
  parseCache(unparsedCache: DaoNetworkCache): DaoNetworkCache {
    unparsedCache.daoInfo.ethBalance = bnum(
      unparsedCache.daoInfo.ethBalance || '0'
    );

    if (unparsedCache.daoInfo.repEvents)
      unparsedCache.daoInfo.repEvents.map((repEvent, i) => {
        unparsedCache.daoInfo.repEvents[i].amount = bnum(repEvent.amount);
      });

    Object.keys(unparsedCache.schemes).map(schemeAddress => {
      unparsedCache.schemes[schemeAddress].ethBalance = bnum(
        unparsedCache.schemes[schemeAddress].ethBalance
      );
    });
    Object.keys(unparsedCache.callPermissions).map(asset => {
      Object.keys(unparsedCache.callPermissions[asset]).map(from => {
        Object.keys(unparsedCache.callPermissions[asset][from]).map(to => {
          Object.keys(unparsedCache.callPermissions[asset][from][to]).map(
            functionSignature => {
              unparsedCache.callPermissions[asset][from][to][
                functionSignature
              ].value = bnum(
                unparsedCache.callPermissions[asset][from][to][
                  functionSignature
                ].value
              );
            }
          );
        });
      });
    });
    Object.keys(unparsedCache.proposals).map(proposalId => {
      unparsedCache.proposals[proposalId].values = unparsedCache.proposals[
        proposalId
      ].values.map(value => {
        return bnum(value);
      });
      unparsedCache.proposals[proposalId].stateInScheme =
        unparsedCache.proposals[proposalId].stateInScheme;
      unparsedCache.proposals[proposalId].stateInVotingMachine =
        unparsedCache.proposals[proposalId].stateInVotingMachine;
      unparsedCache.proposals[proposalId].currentBoostedVotePeriodLimit = bnum(
        unparsedCache.proposals[proposalId].currentBoostedVotePeriodLimit
      );
      unparsedCache.proposals[proposalId].daoBountyRemain = bnum(
        unparsedCache.proposals[proposalId].daoBountyRemain
      );
      unparsedCache.proposals[proposalId].daoBounty = bnum(
        unparsedCache.proposals[proposalId].daoBounty
      );
      unparsedCache.proposals[proposalId].totalStakes = bnum(
        unparsedCache.proposals[proposalId].totalStakes
      );
      unparsedCache.proposals[proposalId].confidenceThreshold = bnum(
        unparsedCache.proposals[proposalId].confidenceThreshold
      );
      unparsedCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted =
        bnum(
          unparsedCache.proposals[proposalId]
            .secondsFromTimeOutTillExecuteBoosted
        );
      unparsedCache.proposals[proposalId].submittedTime = bnum(
        unparsedCache.proposals[proposalId].submittedTime
      );
      unparsedCache.proposals[proposalId].preBoostedPhaseTime = bnum(
        unparsedCache.proposals[proposalId].preBoostedPhaseTime
      );
      unparsedCache.proposals[proposalId].boostedPhaseTime = bnum(
        unparsedCache.proposals[proposalId].boostedPhaseTime
      );
      unparsedCache.proposals[proposalId].positiveVotes = bnum(
        unparsedCache.proposals[proposalId].positiveVotes
      );
      unparsedCache.proposals[proposalId].negativeVotes = bnum(
        unparsedCache.proposals[proposalId].negativeVotes
      );
      unparsedCache.proposals[proposalId].preBoostedPositiveVotes = bnum(
        unparsedCache.proposals[proposalId].preBoostedPositiveVotes
      );
      unparsedCache.proposals[proposalId].preBoostedNegativeVotes = bnum(
        unparsedCache.proposals[proposalId].preBoostedNegativeVotes
      );
      unparsedCache.proposals[proposalId].positiveStakes = bnum(
        unparsedCache.proposals[proposalId].positiveStakes
      );
      unparsedCache.proposals[proposalId].negativeStakes = bnum(
        unparsedCache.proposals[proposalId].negativeStakes
      );
    });

    Object.keys(unparsedCache.votingMachines).map(votingMachineAddress => {
      Object.keys(
        unparsedCache.votingMachines[votingMachineAddress].votingParameters
      ).map(paramsHash => {
        const unparsedParams =
          unparsedCache.votingMachines[votingMachineAddress].votingParameters[
            paramsHash
          ];
        unparsedCache.votingMachines[votingMachineAddress].votingParameters[
          paramsHash
        ] = {
          queuedVoteRequiredPercentage: bnum(
            unparsedParams.queuedVoteRequiredPercentage
          ),
          queuedVotePeriodLimit: bnum(unparsedParams.queuedVotePeriodLimit),
          boostedVotePeriodLimit: bnum(unparsedParams.boostedVotePeriodLimit),
          preBoostedVotePeriodLimit: bnum(
            unparsedParams.preBoostedVotePeriodLimit
          ),
          thresholdConst: bnum(unparsedParams.thresholdConst),
          limitExponentValue: bnum(unparsedParams.limitExponentValue),
          quietEndingPeriod: bnum(unparsedParams.quietEndingPeriod),
          proposingRepReward: bnum(unparsedParams.proposingRepReward),
          votersReputationLossRatio: bnum(
            unparsedParams.votersReputationLossRatio
          ),
          minimumDaoBounty: bnum(unparsedParams.minimumDaoBounty),
          daoBountyConst: bnum(unparsedParams.daoBountyConst),
          activationTime: bnum(unparsedParams.activationTime),
        };
      });
    });
    return unparsedCache;
  }

  getCache(): DaoNetworkCache {
    return this.daoCache;
  }

  setCache(newNetworkCache: DaoNetworkCache) {
    this.daoCache = this.parseCache(newNetworkCache);
    console.debug('Cache SET]', this.daoCache);
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

  getSchemeProposals(schemeAddress: string): Proposal[] {
    let proposals = [];
    for (const proposalId in this.getCache().proposals) {
      if (this.getCache().proposals[proposalId].scheme === schemeAddress) {
        proposals.push(this.getProposal(proposalId));
      }
    }
    return proposals;
  }

  getAmountOfProposalsPreBoostedInScheme(schemeAddress: string): number {
    return this.getSchemeProposals(schemeAddress).filter(proposal => {
      return proposal.stateInVotingMachine === 4;
    }).length;
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

    let repUsers = {};
    let repEvents = [];
    let repTotalSupply = bnum(0);
    let blockNumber = 0;
    for (let i = 0; i < cache.daoInfo.repEvents.length; i++) {
      if (cache.daoInfo.repEvents[i].event === 'Mint') {
        repTotalSupply = repTotalSupply.plus(cache.daoInfo.repEvents[i].amount);
        if (repUsers[cache.daoInfo.repEvents[i].account]) {
          repUsers[cache.daoInfo.repEvents[i].account] = repUsers[
            cache.daoInfo.repEvents[i].account
          ].plus(cache.daoInfo.repEvents[i].amount);
        } else {
          repUsers[cache.daoInfo.repEvents[i].account] =
            cache.daoInfo.repEvents[i].amount;
        }
      } else if (cache.daoInfo.repEvents[i].event === 'Burn') {
        repTotalSupply = repTotalSupply.minus(
          cache.daoInfo.repEvents[i].amount
        );
        if (repUsers[cache.daoInfo.repEvents[i].account]) {
          repUsers[cache.daoInfo.repEvents[i].account] = repUsers[
            cache.daoInfo.repEvents[i].account
          ].minus(cache.daoInfo.repEvents[i].amount);
        } else {
          console.error('ERROR on duplicated REP');
        }
      }

      if (cache.daoInfo.repEvents[i].blockNumber > blockNumber) {
        blockNumber = cache.daoInfo.repEvents[i].blockNumber;
        repEvents.push([
          blockNumber,
          bnum(repTotalSupply)
            .div(10 ** 18)
            .toNumber(),
        ]);
      }
    }
    let rep = [];
    for (const userAddress in repUsers) {
      rep.push([
        userAddress,
        repUsers[userAddress].div(bnum(repTotalSupply)).toNumber(),
      ]);
    }
    rep = _.sortBy(rep, [
      function (o) {
        return o[1];
      },
    ]);
    rep.unshift(['User Address', 'REP %']);
    repEvents.unshift(['Block', 'Total Rep']);

    Object.keys(cache.votingMachines).map(votingMachineAddress => {
      cache.votingMachines[votingMachineAddress].events.votes.map(vote => {
        if (!users[vote.voter])
          users[vote.voter] = {
            correctVotes: 0,
            wrongVotes: 0,
            correctStakes: 0,
            wrongStakes: 0,
            proposals: 0,
            totalVoted: bnum(0),
            totalStaked: bnum(0),
            score: 0,
          };

        if (!cache.proposals[vote.proposalId]) {
          console.debug('MISSING PROPOSAL', vote.proposalId);
        } else {
          if (vote.vote === 1) {
            totalPositiveVotes++;
            totalPositiveVotesAmount = totalPositiveVotesAmount.plus(
              bnum(vote.amount)
            );
          } else {
            totalNegativeVotes++;
            totalNegativeVotesAmount = totalNegativeVotesAmount.plus(
              bnum(vote.amount)
            );
          }
          if (cache.proposals[vote.proposalId].winningVote === vote.vote) {
            users[vote.voter].correctVotes++;
            users[vote.voter].totalVoted = users[vote.voter].totalVoted.plus(
              bnum(vote.amount)
            );
            users[vote.voter].score += 3;
          } else {
            users[vote.voter].wrongVotes++;
            users[vote.voter].totalVoted = users[vote.voter].totalVoted.plus(
              bnum(vote.amount)
            );
            users[vote.voter].score += 1;
          }
        }
      });
      cache.votingMachines[votingMachineAddress].events.stakes.map(stake => {
        if (!users[stake.staker])
          users[stake.staker] = {
            correctVotes: 0,
            wrongVotes: 0,
            correctStakes: 0,
            wrongStakes: 0,
            proposals: 0,
            totalVoted: bnum(0),
            totalStaked: bnum(0),
            score: 0,
          };

        if (!cache.proposals[stake.proposalId]) {
          console.debug('MISSING PROPOSAL', stake.proposalId);
        } else {
          if (stake.vote === 1) {
            totalPositiveStakes++;
            totalPositiveStakesAmount = totalPositiveStakesAmount.plus(
              bnum(stake.amount)
            );
          } else {
            totalNegativeStakes++;
            totalNegativeStakesAmount = totalNegativeStakesAmount.plus(
              bnum(stake.amount)
            );
          }

          if (cache.proposals[stake.proposalId].winningVote === stake.vote) {
            users[stake.staker].correctStakes++;
            users[stake.staker].totalStaked = users[
              stake.staker
            ].totalStaked.plus(bnum(stake.amount));
            users[stake.staker].score += 1;
          } else {
            users[stake.staker].wrongStakes++;
            users[stake.staker].totalStaked = users[
              stake.staker
            ].totalStaked.plus(bnum(stake.amount));
          }
        }
      });
    });

    Object.keys(cache.proposals).map(proposalId => {
      const proposalCreator = cache.proposals[proposalId].proposer;

      if (proposalCreator !== '0x0000000000000000000000000000000000000000') {
        if (!users[proposalCreator])
          users[proposalCreator] = {
            correctVotes: 0,
            wrongVotes: 0,
            correctStakes: 0,
            wrongStakes: 0,
            proposals: 0,
            totalVoted: bnum(0),
            totalStaked: bnum(0),
            score: 0,
          };

        const score = cache.proposals[proposalId].positiveVotes
          .plus(cache.proposals[proposalId].negativeVotes)
          .div(this.getRepAt().totalSupply)
          .div('0.20')
          .times('10')
          .toFixed(2);
        users[proposalCreator].score += Math.min(
          Math.min(Number(score), 1),
          30
        );
        users[proposalCreator].proposals++;
      } else {
        console.debug(
          'Couldnt get proposer for proposal',
          proposalId,
          'in scheme',
          cache.schemes[cache.proposals[proposalId].scheme].name,
          'in transaction',
          cache.proposals[proposalId].creationEvent.tx
        );
      }
      totalProposalsCreated++;
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
        Object.keys(users).map(key =>
          Object.assign({ address: key }, users[key])
        ),
        ['score'],
        ['desc']
      ),
    };
  }

  getAllProposals(): Proposal[] {
    const allProposals = Object.keys(this.getCache().proposals).map(
      proposalId => {
        return this.getCache().proposals[proposalId];
      }
    );
    return _.orderBy(
      allProposals,
      [
        'creationEvent.blockNumber',
        'creationEvent.transactionIndex',
        'creationEvent.logIndex',
      ],
      ['asc', 'asc', 'asc', 'asc']
    );
  }

  getAllSchemes(): Scheme[] {
    return _.flatMap(_.filter(this.getCache().schemes, {registered: true}));
  }

  getProposal(proposalId): Proposal {
    return this.getCache().proposals[proposalId];
  }

  getScheme(schemeAddress): Scheme {
    return this.getCache().schemes[schemeAddress];
  }

  getVotingMachineOfProposal(proposalId): string {
    return this.getCache().schemes[this.getCache().proposals[proposalId].scheme]
      .votingMachine;
  }

  getVotingParametersOfProposal(proposalId): VotingMachineParameters {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].votingParameters[this.getCache().proposals[proposalId].paramsHash];
  }

  getVotingParametersOfScheme(schemeAddress): VotingMachineParameters {
    const scheme = this.getCache().schemes[schemeAddress];
    return this.getCache().votingMachines[scheme.votingMachine]
      .votingParameters[scheme.paramsHash];
  }

  getProposalEvents(proposalId): {
    votes: Vote[];
    stakes: Stake[];
    redeems: Redeem[];
    redeemsRep: RedeemRep[];
    redeemsDaoBounty: RedeemDaoBounty[];
    stateChanges: ProposalStateChange[];
    history: {
      text: string[];
      textParams: string[];
      event: any;
    }[];
  } {
    const proposalEvents = {
      votes: this.getVotesOfProposal(proposalId),
      stakes: this.getStakesOfProposal(proposalId),
      redeems: this.getRedeemsOfProposal(proposalId),
      redeemsRep: this.getRedeemsRepOfProposal(proposalId),
      redeemsDaoBounty: this.getRedeemsDaoBountyOfProposal(proposalId),
      stateChanges: this.getProposalStateChanges(proposalId),
    };

    const proposal = this.getProposal(proposalId);
    const totalRep = this.getRepAt().totalSupply;

    let history = proposalEvents.votes
      .map(event => {
        return {
          text: [
            `Vote from `,
            `of ${bnum(event.amount)
              .times('100')
              .div(totalRep)
              .toFixed(4)} % REP on decision ${VoteDecision[event.vote]}`,
          ],
          textParams: [event.voter],
          event: {
            proposalId: event.proposalId,
            tx: event.tx,
            block: event.blockNumber,
            transactionIndex: event.transactionIndex,
            logIndex: event.logIndex,
            timestamp: event.timestamp,
          },
        };
      })
      .concat(
        proposalEvents.stakes.map(event => {
          return {
            text: [
              `Stake from `,
              `of ${normalizeBalance(
                event.amount
              ).toString()} staking token on decision ${
                VoteDecision[event.vote]
              }`,
            ],
            textParams: [event.staker],
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeems.map(event => {
          return {
            text: [`Staking token Redeem from `, ` of ${event.amount}`],
            textParams: [event.beneficiary],
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeemsRep.map(event => {
          return {
            text: [`REP Redeem from `, ` of ${event.amount}`],
            textParams: [event.beneficiary],
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeemsDaoBounty.map(event => {
          return {
            text: [`Staking token Redeem from `, ` of ${event.amount}`],
            textParams: [event.beneficiary],
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.stateChanges.map(event => {
          return {
            text: [
              `Proposal change to state ${
                VotingMachineProposalState[event.state]
              }`,
            ],
            textParams: [],
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      );
    history.push({
      text: [`Proposal created by`],
      textParams: [proposal.proposer],
      event: {
        proposalId: proposal.id,
        tx: proposal.creationEvent.tx,
        block: proposal.creationEvent.blockNumber,
        transactionIndex: proposal.creationEvent.transactionIndex,
        logIndex: proposal.creationEvent.logIndex,
        timestamp: proposal.creationEvent.timestamp,
      },
    });

    history = _.orderBy(
      history,
      ['event.timestamp', 'event.logIndex'],
      ['asc', 'asc']
    );

    return {
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      redeemsDaoBounty: proposalEvents.redeemsDaoBounty,
      stateChanges: proposalEvents.stateChanges,
      history: history,
    };
  }

  getUser(userAddress): {
    repBalance: BigNumber;
    repPercentage: string;
  } {
    const { providerStore } = this.context;
    const { userRep, totalSupply } = this.getRepAt(
      userAddress,
      providerStore.getCurrentBlockNumber()
    );
    return {
      repBalance: userRep,
      repPercentage: userRep
        ? formatPercentage(userRep.div(totalSupply), 2, false)
        : '0',
    };
  }

  getUserEvents(userAddress): {
    votes: Vote[];
    stakes: Stake[];
    redeems: Redeem[];
    redeemsRep: RedeemRep[];
    redeemsDaoBounty: RedeemDaoBounty[];
    newProposal: ProposalEvent[];
    history: {
      text: string;
      event: any;
    }[];
  } {
    let history: {
      text: string;
      event: any;
    }[] = [];

    const cache = this.getCache();
    const votingMachines =
      this.context.configStore.getNetworkContracts().votingMachines;
    let proposalEvents = {
      votes: [],
      stakes: [],
      redeems: [],
      redeemsRep: [],
      redeemsDaoBounty: [],
    };

    for (const votingMachineName in votingMachines) {
      const votingMachine = votingMachines[votingMachineName];
      proposalEvents.votes = proposalEvents.votes.concat(
        cache.votingMachines[votingMachine.address].events.votes.filter(
          vote => {
            return userAddress === vote.voter;
          }
        )
      );
      proposalEvents.stakes = proposalEvents.stakes.concat(
        cache.votingMachines[votingMachine.address].events.stakes.filter(
          stake => {
            return userAddress === stake.staker;
          }
        )
      );
      proposalEvents.redeems = proposalEvents.redeems.concat(
        cache.votingMachines[votingMachine.address].events.redeems.filter(
          redeem => {
            return userAddress === redeem.beneficiary;
          }
        )
      );
      proposalEvents.redeemsRep = proposalEvents.redeemsRep.concat(
        cache.votingMachines[votingMachine.address].events.redeemsRep.filter(
          redeemRep => {
            return userAddress === redeemRep.beneficiary;
          }
        )
      );
      proposalEvents.redeemsDaoBounty = proposalEvents.redeemsDaoBounty.concat(
        cache.votingMachines[
          votingMachine.address
        ].events.redeemsDaoBounty.filter(redeemDaoBounty => {
          return userAddress === redeemDaoBounty.beneficiary;
        })
      );
    }

    const newProposalEvents: ProposalEvent[] = Object.keys(
      _.pickBy(cache.proposals, proposal => proposal.proposer === userAddress)
    ).map(proposalId => {
      history.push({
        text: `Proposal ${proposalId} created`,
        event: {
          proposalId: proposalId,
          tx: cache.proposals[proposalId].creationEvent.tx,
          block: cache.proposals[proposalId].creationEvent.blockNumber,
          transactionIndex:
            cache.proposals[proposalId].creationEvent.transactionIndex,
          logIndex: cache.proposals[proposalId].creationEvent.logIndex,
          timestamp: cache.proposals[proposalId].creationEvent.timestamp,
        },
      });
      return Object.assign(
        { proposalId: proposalId },
        cache.proposals[proposalId].creationEvent
      );
    });

    history = history
      .concat(
        proposalEvents.votes.map(event => {
          return {
            text: `Voted with ${event.amount} REP for decision ${
              VoteDecision[event.vote]
            } on proposal ${event.proposalId}`,
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.stakes.map(event => {
          return {
            text: `Staked ${event.amount} staking token for decision ${
              VoteDecision[event.vote]
            } on proposal ${event.proposalId}`,
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeems.map(event => {
          return {
            text: `Staking token amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeemsRep.map(event => {
          return {
            text: `REP amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      )
      .concat(
        proposalEvents.redeemsDaoBounty.map(event => {
          return {
            text: `Staking token amount of ${event.amount} redeemed from proposal ${event.proposalId} `,
            event: {
              proposalId: event.proposalId,
              tx: event.tx,
              block: event.blockNumber,
              transactionIndex: event.transactionIndex,
              logIndex: event.logIndex,
              timestamp: event.timestamp,
            },
          };
        })
      );
    history = _.orderBy(
      history,
      ['event.timestamp', 'event.logIndex'],
      ['desc', 'asc']
    );

    return {
      newProposal: newProposalEvents,
      votes: proposalEvents.votes,
      stakes: proposalEvents.stakes,
      redeems: proposalEvents.redeems,
      redeemsRep: proposalEvents.redeemsRep,
      redeemsDaoBounty: proposalEvents.redeemsDaoBounty,
      history,
    };
  }

  getUserRedeemsLeft(userAddress: string): {
    rep: string[];
    stake: string[];
    bounty: string[];
  } {
    const userEvents = this.getUserEvents(userAddress);

    let redeemsLeft = {
      rep: [],
      stake: [],
      bounty: [],
    };

    // Adds user created proposals that have ended
    userEvents.newProposal.map(newProposal => {
      const proposal = this.getProposal(newProposal.proposalId);
      const votingParameters = this.getVotingParametersOfProposal(
        newProposal.proposalId
      );

      if (
        votingParameters.proposingRepReward.toNumber() > 0 &&
        isNotActive(proposal)
      ) {
        redeemsLeft.rep.push(newProposal.proposalId);
      }
    });

    // Add possible redeems
    userEvents.votes.map(vote => {
      const proposal = this.getProposal(vote.proposalId);
      const voteParameters = this.getVotingParametersOfProposal(
        vote.proposalId
      );
      if (
        (isExpired(proposal) && votedBeforeBoosted(proposal, vote)) ||
        (hasLostReputation(voteParameters) &&
          votedBeforeBoosted(proposal, vote) &&
          isWinningVote(proposal, vote) &&
          isNotActive(proposal) &&
          redeemsLeft.rep.indexOf(vote.proposalId) < 0)
      ) {
        redeemsLeft.rep.push(vote.proposalId);
      }
    });
    userEvents.stakes.map(stake => {
      const proposal = this.getProposal(stake.proposalId);
      if (
        proposal.stateInVotingMachine ===
          VotingMachineProposalState.ExpiredInQueue ||
        (isNotActive(proposal) &&
          redeemsLeft.stake.indexOf(stake.proposalId) < 0 &&
          isWinningVote(proposal, stake))
      ) {
        redeemsLeft.stake.push(stake.proposalId);
        if (
          proposal.stateInVotingMachine ===
            VotingMachineProposalState.Executed &&
          proposal.winningVote === 1
        ) {
          redeemsLeft.bounty.push(stake.proposalId);
        }
      }
    });
    // Remove already redeemed
    userEvents.redeemsRep.map(redeemRep => {
      if (redeemsLeft.rep.indexOf(redeemRep.proposalId) > -1)
        redeemsLeft.rep.splice(
          redeemsLeft.rep.indexOf(redeemRep.proposalId),
          1
        );
    });
    userEvents.redeems.map(redeem => {
      if (redeemsLeft.stake.indexOf(redeem.proposalId) > -1)
        redeemsLeft.stake.splice(
          redeemsLeft.stake.indexOf(redeem.proposalId),
          1
        );
    });
    userEvents.redeemsDaoBounty.map(redeemDaoBounty => {
      if (redeemsLeft.bounty.indexOf(redeemDaoBounty.proposalId) > -1)
        redeemsLeft.bounty.splice(
          redeemsLeft.bounty.indexOf(redeemDaoBounty.proposalId),
          1
        );
    });

    return redeemsLeft;
  }

  getProposalStatus(proposalId: string): any {
    const proposal = this.getCache().proposals[proposalId];
    const proposalStateChangeEvents = this.getProposalStateChanges(proposalId);
    const scheme = this.getCache().schemes[proposal.scheme];
    const votingMachineOfProposal = this.getVotingMachineOfProposal(proposalId);
    const networkContracts = this.context.configStore.getNetworkContracts();
    const votingMachineParams =
      proposal.paramsHash ===
      '0x0000000000000000000000000000000000000000000000000000000000000000'
        ? this.getCache().votingMachines[votingMachineOfProposal]
            .votingParameters[scheme.paramsHash]
        : this.getCache().votingMachines[votingMachineOfProposal]
            .votingParameters[proposal.paramsHash];

    const autoBoost =
      networkContracts.votingMachines.dxd &&
      networkContracts.votingMachines.dxd.address === votingMachineOfProposal;
    return decodeProposalStatus(
      proposal,
      proposalStateChangeEvents,
      votingMachineParams,
      scheme.maxSecondsForExecution,
      autoBoost,
      scheme.type
    );
  }

  getVotesOfProposal(proposalId: string): Vote[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.votes.filter(vote => {
      return proposalId === vote.proposalId;
    });
  }

  getStakesOfProposal(proposalId: string): Stake[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.stakes.filter(stake => {
      return proposalId === stake.proposalId;
    });
  }

  getRedeemsOfProposal(proposalId: string): Redeem[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.redeems.filter(redeem => {
      return proposalId === redeem.proposalId;
    });
  }

  getRedeemsRepOfProposal(proposalId: string): RedeemRep[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.redeemsRep.filter(redeemRep => {
      return proposalId === redeemRep.proposalId;
    });
  }

  getRedeemsDaoBountyOfProposal(proposalId: string): RedeemDaoBounty[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.redeemsDaoBounty.filter(redeemDaoBounty => {
      return proposalId === redeemDaoBounty.proposalId;
    });
  }

  getProposalStateChanges(proposalId: string): ProposalStateChange[] {
    return this.getCache().votingMachines[
      this.getVotingMachineOfProposal(proposalId)
    ].events.proposalStateChanges.filter(proposalStateChange => {
      return proposalId === proposalStateChange.proposalId;
    });
  }

  getSchemeRecommendedCalls(schemeAddress): any {
    const networkContracts = this.context.configStore.getNetworkContracts();
    const { library } = this.context.providerStore.getActiveWeb3React();
    const scheme = this.getScheme(schemeAddress);
    const callPermissions = this.getCache().callPermissions;
    console.debug('Call Permissions', callPermissions);
    let assetLimits = {};
    const from =
      scheme.controllerAddress === networkContracts.controller
        ? networkContracts.avatar
        : schemeAddress;
    let recommendedCalls = this.context.configStore.getRecommendedCalls();

    Object.keys(callPermissions).map(assetAddress => {
      const callAllowance = this.getCallAllowance(
        assetAddress,
        from,
        schemeAddress,
        ANY_FUNC_SIGNATURE
      );
      if (callAllowance.fromTime > 0 && callAllowance.value.lt(MAX_UINT))
        assetLimits[assetAddress] = callAllowance.value;
    });

    for (let i = 0; i < recommendedCalls.length; i++) {
      const callAllowance = this.getCallAllowance(
        recommendedCalls[i].asset,
        from,
        recommendedCalls[i].to,
        library.eth.abi.encodeFunctionSignature(
          recommendedCalls[i].functionName
        )
      );
      recommendedCalls[i]['functionSignature'] =
        library.eth.abi.encodeFunctionSignature(
          recommendedCalls[i].functionName
        );
      recommendedCalls[i]['value'] = callAllowance.value;
      recommendedCalls[i]['fromTime'] = callAllowance.fromTime;
    }

    return { assetLimits, recommendedCalls };
  }

  getCallAllowance(asset, from, to, functionSignature): any {
    const networkContracts = this.context.configStore.getNetworkContracts();
    const callPermissions = this.getCache().callPermissions;

    if (
      to === networkContracts.controller &&
      from !== networkContracts.avatar
    ) {
      return {
        value: bnum(0),
        fromTime: 0,
      };
    } else if (
      asset === ZERO_ADDRESS &&
      to === networkContracts.permissionRegistry &&
      from === networkContracts.avatar
    ) {
      return {
        value: bnum(0),
        fromTime: 1,
      };
    } else if (!callPermissions[asset] || !callPermissions[asset][from]) {
      return {
        value: bnum(0),
        fromTime: 0,
      };
    } else if (
      callPermissions[asset][from][to] &&
      callPermissions[asset][from][to][functionSignature]
    ) {
      return {
        value: callPermissions[asset][from][to][functionSignature].value,
        fromTime: callPermissions[asset][from][to][functionSignature].fromTime,
      };
    } else if (
      callPermissions[asset][from][to] &&
      callPermissions[asset][from][to][ANY_FUNC_SIGNATURE]
    ) {
      return {
        value: callPermissions[asset][from][to][ANY_FUNC_SIGNATURE].value,
        fromTime: callPermissions[asset][from][to][ANY_FUNC_SIGNATURE].fromTime,
      };
    } else if (
      callPermissions[asset][from][ANY_ADDRESS] &&
      callPermissions[asset][from][ANY_ADDRESS][functionSignature]
    ) {
      return {
        value:
          callPermissions[asset][from][ANY_ADDRESS][functionSignature].value,
        fromTime:
          callPermissions[asset][from][ANY_ADDRESS][functionSignature].fromTime,
      };
    } else if (
      callPermissions[asset][from][ANY_ADDRESS] &&
      callPermissions[asset][from][ANY_ADDRESS][ANY_FUNC_SIGNATURE]
    ) {
      return {
        value:
          callPermissions[asset][from][ANY_ADDRESS][ANY_FUNC_SIGNATURE].value,
        fromTime:
          callPermissions[asset][from][ANY_ADDRESS][ANY_FUNC_SIGNATURE]
            .fromTime,
      };
    } else {
      return {
        value: bnum(0),
        fromTime: 0,
      };
    }
  }

  getRepAt(
    userAddress: string = ZERO_ADDRESS,
    atBlock: number = 0,
    atTime: number = 0
  ): {
    userRep: BigNumber;
    totalSupply: BigNumber;
  } {
    const { daoStore, providerStore } = this.context;
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let userRep = bnum(0),
      totalSupply = bnum(0);
    if (atBlock === 0) atBlock = providerStore.getCurrentBlockNumber();

    for (let i = 0; i < repEvents.length; i++) {
      if (
        atTime > 0
          ? repEvents[i].timestamp < atTime
          : repEvents[i].blockNumber < atBlock
      ) {
        if (repEvents[i].event === 'Mint') {
          totalSupply = totalSupply.plus(repEvents[i].amount);
          if (repEvents[i].account === userAddress)
            userRep = userRep.plus(repEvents[i].amount);
        } else if (repEvents[i].event === 'Burn') {
          totalSupply = totalSupply.minus(repEvents[i].amount);
          if (repEvents[i].account === userAddress)
            userRep = userRep.minus(repEvents[i].amount);
        }
      }
    }
    return { userRep, totalSupply };
  }

  // total supply calculation broken
  getRepEventsOfUser(
    userAddress: string = ZERO_ADDRESS,
    atBlock: number = 0
  ): {
    userRep: RepEvent[];
  } {
    const { daoStore, providerStore } = this.context;
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let userRep = [],
      totalSupply = bnum(0);
    if (atBlock === 0) atBlock = providerStore.getCurrentBlockNumber();

    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i].blockNumber <= atBlock) {
        if (repEvents[i].event === 'Mint') {
          totalSupply = totalSupply.plus(repEvents[i].amount);
          if (repEvents[i].account === userAddress) userRep.push(repEvents[i]);
        }
      }
    }
    return { userRep };
  }

  getUsersRep(): {
    [userAddress: string]: BigNumber;
  } {
    const { daoStore, providerStore } = this.context;
    const repEvents = daoStore.getCache().daoInfo.repEvents;
    let users = {};
    const atBlock = providerStore.getCurrentBlockNumber();

    for (let i = 0; i < repEvents.length; i++) {
      if (repEvents[i].blockNumber <= atBlock) {
        if (repEvents[i].event === 'Mint') {
          if (!users[repEvents[i].account])
            users[repEvents[i].account] = repEvents[i].amount;
          else
            users[repEvents[i].account] = users[repEvents[i].account].plus(
              repEvents[i].amount
            );
        } else if (repEvents[i].event === 'Burn') {
          if (users[repEvents[i].account])
            users[repEvents[i].account] = users[repEvents[i].account].minus(
              repEvents[i].amount
            );
        }
      }
    }
    return users;
  }

  getAllVestingContracts(): TokenVesting[] {
    return this.daoCache.vestingContracts ?? [];
  }

  getUserVestingContracts(beneficiaryAddress: string): TokenVesting[] {
    return (
      this.daoCache.vestingContracts?.filter(
        contract => contract.beneficiary === beneficiaryAddress
      ) ?? []
    );
  }
}
