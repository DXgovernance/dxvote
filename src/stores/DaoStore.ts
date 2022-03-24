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
  isVoteYes,
} from '../utils';
import { TokenVesting } from '../types/types';
import { ProposalsExtended } from '../types/types';

const proposalTitles = require('../configs/proposalTitles.json');

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
    if (unparsedCache.reputation.events)
      unparsedCache.reputation.events.map((repEvent, i) => {
        unparsedCache.reputation.events[i].amount = bnum(repEvent.amount);
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
      unparsedCache.proposals[proposalId].positiveStakes = bnum(
        unparsedCache.proposals[proposalId].positiveStakes
      );
      unparsedCache.proposals[proposalId].negativeStakes = bnum(
        unparsedCache.proposals[proposalId].negativeStakes
      );

      // Update proposal title from proposalTitles.json file
      if (!unparsedCache.proposals[proposalId].title) {
        unparsedCache.proposals[proposalId].title =
          proposalTitles[proposalId] || '';
      }
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

  setCache(newNetworkCache: DaoNetworkCache) {
    this.daoCache = this.parseCache(newNetworkCache);
    console.debug('[Cache SET]', this.daoCache);
  }

  getAmountOfProposalsPreBoostedInScheme(schemeAddress: string): number {
    return this.getAllProposals({ scheme: schemeAddress }).filter(proposal => {
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
    const cache = this.daoCache;

    let repUsers = {};
    let repEvents = [];
    let repTotalSupply = bnum(0);
    let blockNumber = 0;
    for (let i = 0; i < cache.reputation.events.length; i++) {
      if (cache.reputation.events[i].event === 'Mint') {
        repTotalSupply = repTotalSupply.plus(cache.reputation.events[i].amount);
        if (repUsers[cache.reputation.events[i].account]) {
          repUsers[cache.reputation.events[i].account] = repUsers[
            cache.reputation.events[i].account
          ].plus(cache.reputation.events[i].amount);
        } else {
          repUsers[cache.reputation.events[i].account] =
            cache.reputation.events[i].amount;
        }
      } else if (cache.reputation.events[i].event === 'Burn') {
        repTotalSupply = repTotalSupply.minus(
          cache.reputation.events[i].amount
        );
        if (repUsers[cache.reputation.events[i].account]) {
          repUsers[cache.reputation.events[i].account] = repUsers[
            cache.reputation.events[i].account
          ].minus(cache.reputation.events[i].amount);
        } else {
          console.error('ERROR on duplicated REP');
        }
      }

      if (cache.reputation.events[i].blockNumber > blockNumber) {
        blockNumber = cache.reputation.events[i].blockNumber;
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

  getAllProposals(filter: any = {}): ProposalsExtended[] {
    const allProposals = Object.keys(this.daoCache.proposals).map(
      proposalId => {
        return this.daoCache.proposals[proposalId];
      }
    );
    const proposals = _.orderBy(
      allProposals,
      [
        'creationEvent.blockNumber',
        'creationEvent.transactionIndex',
        'creationEvent.logIndex',
      ],
      ['asc', 'asc', 'asc', 'asc']
    ).map(cacheProposal => {
      return Object.assign(
        cacheProposal,
        this.getProposalStatus(cacheProposal.id)
      );
    });
    return _.filter(proposals, filter);
  }

  getAllSchemes(onlyRegistered: boolean = true): Scheme[] {
    return _.flatMap(
      _.filter(
        this.daoCache.schemes,
        onlyRegistered ? { registered: true } : {}
      )
    );
  }

  getProposal(proposalId: string): Proposal {
    return this.daoCache.proposals[proposalId];
  }

  getScheme(schemeAddress: string): Scheme {
    return this.daoCache.schemes[schemeAddress];
  }

  getSchemeOfProposal(proposalId: string): Scheme {
    return this.daoCache.schemes[this.daoCache.proposals[proposalId].scheme];
  }

  getVotingMachineOfScheme(schemeAddress: string): {
    address: string;
    paramsHash: string;
    params: VotingMachineParameters;
  } {
    const votingMachineAddress =
      this.daoCache.schemes[schemeAddress].votingMachine;
    return {
      address: votingMachineAddress,
      paramsHash: this.daoCache.schemes[schemeAddress].paramsHash,
      params:
        this.daoCache.votingMachines[votingMachineAddress].votingParameters[
          this.daoCache.schemes[schemeAddress].paramsHash
        ],
    };
  }

  getVotingMachineOfProposal(proposalId: string): {
    address: string;
    paramsHash: string;
    params: VotingMachineParameters;
  } {
    const votingMachineAddress =
      this.daoCache.schemes[this.daoCache.proposals[proposalId].scheme]
        .votingMachine;

    const paramsHash =
      this.daoCache.proposals[proposalId].paramsHash ===
      '0x0000000000000000000000000000000000000000000000000000000000000000'
        ? this.daoCache.schemes[this.daoCache.proposals[proposalId].scheme]
            .paramsHash
        : this.daoCache.proposals[proposalId].paramsHash;

    return {
      address: votingMachineAddress,
      paramsHash,
      params:
        this.daoCache.votingMachines[votingMachineAddress].votingParameters[
          paramsHash
        ],
    };
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
            text: [`Staking token redeem from `, ` of ${event.amount}`],
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
            text: [
              `Staking token bounty redeemed from `,
              ` of ${event.amount}`,
            ],
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

    const cache = this.daoCache;
    const totalRep = this.getRepAt().totalSupply;

    let proposalEvents = {
      votes: [],
      stakes: [],
      redeems: [],
      redeemsRep: [],
      redeemsDaoBounty: [],
    };

    Object.keys(cache.votingMachines).map(votingMachine => {
      proposalEvents.votes = proposalEvents.votes.concat(
        cache.votingMachines[votingMachine].events.votes.filter(vote => {
          return userAddress === vote.voter;
        })
      );
      proposalEvents.stakes = proposalEvents.stakes.concat(
        cache.votingMachines[votingMachine].events.stakes.filter(stake => {
          return userAddress === stake.staker;
        })
      );
      proposalEvents.redeems = proposalEvents.redeems.concat(
        cache.votingMachines[votingMachine].events.redeems.filter(redeem => {
          return userAddress === redeem.beneficiary;
        })
      );
      proposalEvents.redeemsRep = proposalEvents.redeemsRep.concat(
        cache.votingMachines[votingMachine].events.redeemsRep.filter(
          redeemRep => {
            return userAddress === redeemRep.beneficiary;
          }
        )
      );
      proposalEvents.redeemsDaoBounty = proposalEvents.redeemsDaoBounty.concat(
        cache.votingMachines[votingMachine].events.redeemsDaoBounty.filter(
          redeemDaoBounty => {
            return userAddress === redeemDaoBounty.beneficiary;
          }
        )
      );
    });

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
            text: `Voted with ${bnum(event.amount)
              .times('100')
              .div(totalRep)
              .toFixed(4)} % REP for decision ${
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
          this.getVotingMachineOfProposal(event.proposalId);
          return {
            text: `Staking token bounty of ${event.amount} redeemed from proposal ${event.proposalId} `,
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
    bounty: { [proposalId: string]: BigNumber };
  } {
    const userEvents = this.getUserEvents(userAddress);

    let redeemsLeft = {
      rep: [],
      stake: [],
      bounty: {},
    };

    // Adds user created proposals that have ended
    userEvents.newProposal.map(newProposal => {
      const proposal = this.getProposal(newProposal.proposalId);
      const votingParameters = this.getVotingMachineOfProposal(
        newProposal.proposalId
      ).params;

      if (
        votingParameters.proposingRepReward.toNumber() > 0 &&
        isNotActive(proposal) &&
        isVoteYes(proposal.winningVote)
      ) {
        redeemsLeft.rep.push(newProposal.proposalId);
      }
    });

    // Add possible redeems
    userEvents.votes.map(vote => {
      const proposal = this.getProposal(vote.proposalId);
      const voteParameters = this.getVotingMachineOfProposal(
        vote.proposalId
      ).params;
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
        (isNotActive(proposal) && isWinningVote(proposal, stake))
      ) {
        // Add proposal redeem if it was not added yet
        if (redeemsLeft.stake.indexOf(stake.proposalId) < 0)
          redeemsLeft.stake.push(stake.proposalId);

        // If proposal executed and stake was for YES, then add the bounty
        if (
          proposal.stateInVotingMachine ===
            VotingMachineProposalState.Executed &&
          isVoteYes(stake.vote)
        ) {
          const proposalDaoBounty = this.getProposal(
            stake.proposalId
          ).daoBounty;
          const proposalWinningStakes = this.getProposal(
            stake.proposalId
          ).positiveStakes;
          const bountyToRedeem = bnum(stake.amount)
            .times(proposalDaoBounty)
            .div(proposalWinningStakes)
            .integerValue();

          redeemsLeft.bounty[stake.proposalId] = redeemsLeft.bounty[
            stake.proposalId
          ]
            ? bnum(redeemsLeft.bounty[stake.proposalId]).plus(bountyToRedeem)
            : bountyToRedeem;
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
      redeemsLeft.bounty[redeemDaoBounty.proposalId] = bnum(
        redeemsLeft.bounty[redeemDaoBounty.proposalId]
      )
        .minus(bnum(redeemDaoBounty.amount))
        .integerValue();

      if (redeemsLeft.bounty[redeemDaoBounty.proposalId].lte(0))
        delete redeemsLeft.bounty[redeemDaoBounty.proposalId];
    });

    return redeemsLeft;
  }

  getProposalStatus(proposalId: string): any {
    const proposal = this.daoCache.proposals[proposalId];
    const proposalStateChangeEvents = this.getProposalStateChanges(proposalId);
    const scheme = this.daoCache.schemes[proposal.scheme];
    const votingMachineOfProposal = this.getVotingMachineOfProposal(proposalId);
    const networkContracts = this.context.configStore.getNetworkContracts();
    const autoBoost =
      networkContracts.votingMachines[votingMachineOfProposal.address].type ===
      'DXDVotingMachine';
    return decodeProposalStatus(
      proposal,
      proposalStateChangeEvents,
      votingMachineOfProposal.params,
      scheme.maxSecondsForExecution,
      autoBoost,
      scheme.type
    );
  }

  getVotesOfProposal(proposalId: string): Vote[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.votes.filter(vote => {
      return proposalId === vote.proposalId;
    });
  }

  getStakesOfProposal(proposalId: string): Stake[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.stakes.filter(stake => {
      return proposalId === stake.proposalId;
    });
  }

  getRedeemsOfProposal(proposalId: string): Redeem[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.redeems.filter(redeem => {
      return proposalId === redeem.proposalId;
    });
  }

  getRedeemsRepOfProposal(proposalId: string): RedeemRep[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.redeemsRep.filter(redeemRep => {
      return proposalId === redeemRep.proposalId;
    });
  }

  getRedeemsDaoBountyOfProposal(proposalId: string): RedeemDaoBounty[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.redeemsDaoBounty.filter(redeemDaoBounty => {
      return proposalId === redeemDaoBounty.proposalId;
    });
  }

  getProposalStateChanges(proposalId: string): ProposalStateChange[] {
    return this.daoCache.votingMachines[
      this.getVotingMachineOfProposal(proposalId).address
    ].events.proposalStateChanges.filter(proposalStateChange => {
      return proposalId === proposalStateChange.proposalId;
    });
  }

  getSchemeRecommendedCalls(schemeAddress): any {
    const networkContracts = this.context.configStore.getNetworkContracts();
    const { library } = this.context.providerStore.getActiveWeb3React();
    const scheme = this.getScheme(schemeAddress);
    const callPermissions = this.daoCache.callPermissions;
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

      if (
        recommendedCalls[i].to == networkContracts.permissionRegistry &&
        recommendedCalls[i].functionName ==
          'setPermission(address,address,bytes4,uint256,bool)'
      )
        recommendedCalls[i]['fromTime'] = 1;
    }

    return { assetLimits, recommendedCalls };
  }

  getCallAllowance(asset, from, to, functionSignature): any {
    const networkContracts = this.context.configStore.getNetworkContracts();
    const callPermissions = this.daoCache.callPermissions;

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
    const repEvents = daoStore.daoCache.reputation.events;
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
    const repEvents = daoStore.daoCache.reputation.events;
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
    const repEvents = daoStore.daoCache.reputation.events;
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
