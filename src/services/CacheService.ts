import RootContext from '../contexts';
import {
  batchPromisesOntarget,
  getAppConfig,
  getDefaultConfigHashes,
  getIPFSFile,
  getProposalTitles,
  NETWORK_NAMES,
} from '../utils';
import Web3 from 'web3';
import _ from 'lodash';
import {
  bnum,
  ZERO_HASH,
  ZERO_ADDRESS,
  sleep,
  decodePermission,
  WalletSchemeProposalState,
  VotingMachineProposalState,
  isWalletScheme,
  getEvents,
  getRawEvents,
  executeMulticall,
  descriptionHashToIPFSHash,
  ipfsHashToDescriptionHash,
  getSchemeConfig,
} from '../utils';

import { getContracts } from '../contracts';

const Hash = require('ipfs-only-hash');
const jsonSort = require('json-keys-sort');

export default class UtilsService {
  context: RootContext;

  constructor(context: RootContext) {
    this.context = context;
  }

  async getUpdatedCacheConfig(
    networksConfig: {
      [netwokId: number]: {
        toBlock: number;
        rpcUrl: string;
        reset: boolean;
      };
    },
    updateProposalTitles: boolean
  ): Promise<{
    proposalTitles: {
      [proposalId: string]: string;
    };
    configHashes: {
      [networkName: string]: string;
    };
    configs: {
      [networkName: string]: NetworkConfig;
    };
    caches: {
      [networkName: string]: DaoNetworkCache;
    };
  }> {
    const updatedCacheConfig = {
      proposalTitles: getProposalTitles(),
      configHashes: {},
      configs: {},
      caches: {},
    };
    // Update the cache and config for each network
    for (let i = 0; i < Object.keys(networksConfig).length; i++) {
      const networkId = Number(Object.keys(networksConfig)[i]);
      const networkName = NETWORK_NAMES[networkId];

      const cacheForNetwork = await this.buildCacheForNetwork(
        new Web3(networksConfig[networkId].rpcUrl),
        networkId,
        networksConfig[networkId].toBlock,
        networksConfig[networkId].reset
      );

      // Update the appConfig file that stores the hashes of the dapp config and network caches
      updatedCacheConfig.configHashes[networkName] = cacheForNetwork.configHash;
      updatedCacheConfig.configs[networkName] = cacheForNetwork.config;
      updatedCacheConfig.caches[networkName] = cacheForNetwork.cache;

      // Get proposal titles
      if (updateProposalTitles) {
        this.context.notificationStore.setGlobalLoading(
          true,
          `Getting proposal titles form ipfs`
        );
        updatedCacheConfig.proposalTitles = Object.assign(
          updatedCacheConfig.proposalTitles,
          await this.updateProposalTitles(
            cacheForNetwork.cache,
            getProposalTitles()
          )
        );
      }
    }

    return updatedCacheConfig;
  }

  async buildCacheForNetwork(
    web3: Web3,
    chainId: number,
    toBlock: number,
    resetCache: boolean = false
  ): Promise<{
    configHash: string;
    config: NetworkConfig;
    cache: DaoNetworkCache;
  }> {
    const networkName = NETWORK_NAMES[chainId];

    // Get the network configuration
    let networkConfig = getAppConfig()[networkName];
    let networkCache: DaoNetworkCache;

    const emptyCache: DaoNetworkCache = {
      networkId: chainId,
      version: 1,
      blockNumber: 1,
      address: networkConfig.contracts.avatar,
      reputation: {
        events: [],
        total: bnum(0),
      },
      schemes: {},
      proposals: {},
      callPermissions: {},
      votingMachines: {},
      ipfsHashes: [],
      vestingContracts: [],
    };

    // Set network cache and config objects
    if (networkName === 'localhost') {
      networkCache = emptyCache;
    } else {
      if (resetCache) {
        networkConfig.cache.toBlock = networkConfig.cache.fromBlock;
        networkConfig.cache.ipfsHash = '';
        networkConfig.version = 1;
        emptyCache.blockNumber = networkConfig.cache.fromBlock;
        networkCache = emptyCache;
      } else {
        console.log(
          `Getting config file from https://ipfs.io/ipfs/${
            getDefaultConfigHashes()[networkName]
          }`
        );
        const networkConfigFileFetch = await getIPFSFile(
          getDefaultConfigHashes()[networkName],
          5000
        );
        console.log(
          `Getting cache file from https://ipfs.io/ipfs/${networkConfigFileFetch.data.cache.ipfsHash}`
        );
        const networkCacheFetch = await getIPFSFile(
          networkConfigFileFetch.data.cache.ipfsHash,
          60000
        );
        networkCache = networkCacheFetch.data;
      }
    }

    // Set block range for the script to run, if cache to block is set that value is used, if not we use last block
    if (Number(networkCache.blockNumber) + 1 < toBlock) {
      // The cache file is updated with the data that had before plus new data in the network cache file
      console.debug(
        'Running cache script from block',
        networkCache.blockNumber + 1,
        'to block',
        toBlock,
        'in network',
        networkName
      );
      networkCache = await this.getUpdatedCache(
        networkCache,
        networkConfig.contracts,
        toBlock,
        web3
      );
    }

    // Write network cache file
    networkCache = await jsonSort.sortAsync(networkCache, true);
    const networkCacheString = JSON.stringify(networkCache, null, 2);

    // Update appConfig file with the latest network config
    networkConfig.cache.toBlock = toBlock;
    networkConfig.cache.ipfsHash = await Hash.of(networkCacheString);
    networkConfig = await jsonSort.sortAsync(networkConfig, true);

    return {
      configHash: await Hash.of(JSON.stringify(networkConfig, null, 2)),
      config: networkConfig,
      cache: networkCache,
    };
  }

  async getUpdatedCache(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const notificationStore = this.context.notificationStore;
    const fromBlock = networkCache.blockNumber + 1;
    console.debug(`[CACHE UPDATE] from ${fromBlock} to ${toBlock}`);
    const networkWeb3Contracts = await getContracts(networkContracts, web3);

    notificationStore.setGlobalLoading(
      true,
      `Collecting reputation and governance events in blocks ${fromBlock} - ${toBlock}`
    );

    networkCache = await batchPromisesOntarget(
      [
        this.updateReputationEvents(
          networkCache,
          networkWeb3Contracts.reputation,
          toBlock,
          web3
        ),
        this.updateVotingMachineEvents(
          networkCache,
          networkContracts,
          toBlock,
          web3
        ),
        this.updateSchemes(networkCache, networkContracts, toBlock, web3),
      ],
      networkCache
    );

    notificationStore.setGlobalLoading(
      true,
      `Updating scheme data in blocks ${fromBlock} - ${toBlock}`
    );

    networkCache = await batchPromisesOntarget(
      [
        this.updatePermissionRegistry(
          networkCache,
          networkContracts,
          toBlock,
          web3
        ),
        this.updateVestingContracts(
          networkCache,
          networkContracts,
          toBlock,
          web3
        ),
      ],
      networkCache
    );

    notificationStore.setGlobalLoading(
      true,
      `Collecting proposals in blocks ${fromBlock} - ${toBlock}`
    );

    networkCache = await batchPromisesOntarget(
      [this.updateProposals(networkCache, networkContracts, toBlock, web3)],
      networkCache
    );

    networkCache.blockNumber = Number(toBlock);

    console.log('Total Proposals', Object.keys(networkCache.proposals).length);

    // Compare proposals data
    // Object.keys(networkCache.proposals).map((proposalId) => {
    //   const mutableData = getProposalMutableData(networkCache, proposalId);
    //   const cacheData = networkCache.proposals[proposalId];
    //   console.debug(proposalId, mutableData, cacheData);
    // })

    // Sort cache data, so the IPFS hash is consistent
    Object.keys(networkCache.schemes).forEach(schemeId => {
      networkCache.schemes[schemeId].proposalIds.sort();
      networkCache.schemes[schemeId].newProposalEvents.sort((a, b) =>
        a.proposalId.localeCompare(b.proposalId)
      );
    });
    networkCache.proposals = Object.keys(networkCache.proposals)
      .sort()
      .reduce((obj, key) => {
        obj[key] = networkCache.proposals[key];
        return obj;
      }, {});
    networkCache.ipfsHashes = _.uniqBy(networkCache.ipfsHashes, 'name');
    networkCache.ipfsHashes.sort((a, b) => a.name.localeCompare(b.name));

    return networkCache;
  }

  // Get all Mint and Burn reputation events to calculate rep by time off chain
  async updateReputationEvents(
    networkCache: DaoNetworkCache,
    reputation: any,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    if (!networkCache.reputation.events) networkCache.reputation.events = [];
    const fromBlock = networkCache.blockNumber + 1;

    let reputationEvents = await getEvents(
      web3,
      reputation,
      fromBlock,
      toBlock,
      'allEvents'
    );

    reputationEvents.map(reputationEvent => {
      switch (reputationEvent.event) {
        case 'Mint':
          networkCache.reputation.events.push({
            event: reputationEvent.event,
            signature: reputationEvent.signature,
            address: reputationEvent.address,
            account: reputationEvent.returnValues._to,
            amount: bnum(reputationEvent.returnValues._amount),
            tx: reputationEvent.transactionHash,
            blockNumber: reputationEvent.blockNumber,
            timestamp: reputationEvent.timestamp,
            transactionIndex: reputationEvent.transactionIndex,
            logIndex: reputationEvent.logIndex,
          });
          break;
        case 'Burn':
          networkCache.reputation.events.push({
            event: reputationEvent.event,
            signature: reputationEvent.signature,
            address: reputationEvent.address,
            account: reputationEvent.returnValues._from,
            amount: bnum(reputationEvent.returnValues._amount),
            tx: reputationEvent.transactionHash,
            blockNumber: reputationEvent.blockNumber,
            timestamp: reputationEvent.timestamp,
            transactionIndex: reputationEvent.transactionIndex,
            logIndex: reputationEvent.logIndex,
          });
          break;
      }
    });

    networkCache.reputation.events = _.uniq(networkCache.reputation.events);

    return networkCache;
  }

  // Update all voting machines
  async updateVotingMachineEvents(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);

    await Promise.all(
      Object.keys(networkWeb3Contracts.votingMachines).map(
        async votingMachineAddress => {
          const votingMachine =
            networkWeb3Contracts.votingMachines[votingMachineAddress].contract;
          if (!networkCache.votingMachines[votingMachine._address])
            networkCache.votingMachines[votingMachine._address] = {
              name: networkWeb3Contracts.votingMachines[votingMachineAddress]
                .name,
              events: {
                votes: [],
                stakes: [],
                redeems: [],
                redeemsRep: [],
                redeemsDaoBounty: [],
                proposalStateChanges: [],
                newProposal: [],
              },
              token:
                networkWeb3Contracts.votingMachines[votingMachine._address]
                  .token._address,
              votingParameters: {},
            };

          networkCache = await this.updateVotingMachine(
            networkCache,
            networkContracts,
            votingMachine,
            toBlock,
            web3
          );
        }
      )
    );

    return networkCache;
  }

  // Update a voting machine information, events, token and voting parameters used.
  async updateVotingMachine(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    votingMachine: any,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const fromBlock = networkCache.blockNumber + 1;

    let newVotingMachineEvents = await getEvents(
      web3,
      votingMachine,
      fromBlock,
      toBlock,
      'allEvents'
    );
    const avatarAddress = web3.utils.toChecksumAddress(networkContracts.avatar);
    const votingMachineEventsInCache =
      networkCache.votingMachines[votingMachine._address].events;
    newVotingMachineEvents.map(votingMachineEvent => {
      const proposalCreated =
        votingMachineEventsInCache.newProposal.findIndex(
          newProposalEvent =>
            votingMachineEvent.returnValues._proposalId ===
            newProposalEvent.proposalId
        ) > -1;

      let existEvent;

      if (
        votingMachineEvent.returnValues._organization === avatarAddress ||
        (votingMachineEvent.event === 'StateChange' && proposalCreated)
      )
        switch (votingMachineEvent.event) {
          case 'NewProposal':
            votingMachineEventsInCache.newProposal.push({
              event: votingMachineEvent.event,
              signature: votingMachineEvent.signature,
              address: votingMachineEvent.address,
              proposer: votingMachineEvent.returnValues._proposer,
              paramHash: votingMachineEvent.returnValues._paramsHash,
              proposalId: votingMachineEvent.returnValues._proposalId,
              tx: votingMachineEvent.transactionHash,
              blockNumber: votingMachineEvent.blockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
            break;
          case 'StateChange':
            votingMachineEventsInCache.proposalStateChanges.push({
              event: votingMachineEvent.event,
              signature: votingMachineEvent.signature,
              address: votingMachineEvent.address,
              state: votingMachineEvent.returnValues._proposalState,
              proposalId: votingMachineEvent.returnValues._proposalId,
              tx: votingMachineEvent.transactionHash,
              blockNumber: votingMachineEvent.blockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
            break;
          case 'VoteProposal':
            const preBoosted =
              votingMachineEventsInCache.proposalStateChanges.findIndex(
                i => i.state === '5'
              ) >= 0;

            existEvent = votingMachineEventsInCache.votes.find(
              event =>
                event.tx === votingMachineEvent.transactionHas &&
                event.transactionIndex ===
                  votingMachineEvent.transactionIndex &&
                event.logIndex === votingMachineEvent.logIndex
            );
            if (existEvent)
              console.debug(
                'Duplicated Vote in votingMachineEvent',
                votingMachineEvent
              );

            !existEvent &&
              votingMachineEventsInCache.votes.push({
                event: votingMachineEvent.event,
                signature: votingMachineEvent.signature,
                address: votingMachineEvent.address,
                voter: votingMachineEvent.returnValues._voter,
                vote: votingMachineEvent.returnValues._vote,
                amount: votingMachineEvent.returnValues._reputation,
                preBoosted: preBoosted,
                proposalId: votingMachineEvent.returnValues._proposalId,
                tx: votingMachineEvent.transactionHash,
                blockNumber: votingMachineEvent.blockNumber,
                timestamp: votingMachineEvent.timestamp,
                transactionIndex: votingMachineEvent.transactionIndex,
                logIndex: votingMachineEvent.logIndex,
              });
            break;
          case 'Stake':
            existEvent = votingMachineEventsInCache.stakes.find(
              event =>
                event.tx === votingMachineEvent.transactionHas &&
                event.transactionIndex ===
                  votingMachineEvent.transactionIndex &&
                event.logIndex === votingMachineEvent.logIndex
            );
            if (existEvent)
              console.debug(
                'Duplicated Stake in votingMachineEvent',
                votingMachineEvent
              );
            !existEvent &&
              votingMachineEventsInCache.stakes.push({
                event: votingMachineEvent.event,
                signature: votingMachineEvent.signature,
                address: votingMachineEvent.address,
                staker: votingMachineEvent.returnValues._staker,
                vote: votingMachineEvent.returnValues._vote,
                amount: votingMachineEvent.returnValues._amount,
                amount4Bounty: bnum('0'),
                proposalId: votingMachineEvent.returnValues._proposalId,
                tx: votingMachineEvent.transactionHash,
                blockNumber: votingMachineEvent.blockNumber,
                timestamp: votingMachineEvent.timestamp,
                transactionIndex: votingMachineEvent.transactionIndex,
                logIndex: votingMachineEvent.logIndex,
              });
            break;
          case 'Redeem':
            existEvent = votingMachineEventsInCache.stakes.find(
              event =>
                event.tx === votingMachineEvent.transactionHas &&
                event.transactionIndex ===
                  votingMachineEvent.transactionIndex &&
                event.logIndex === votingMachineEvent.logIndex
            );
            if (existEvent)
              console.debug(
                'Duplicated Redeem in votingMachineEvent',
                votingMachineEvent
              );
            !existEvent &&
              votingMachineEventsInCache.redeems.push({
                event: votingMachineEvent.event,
                signature: votingMachineEvent.signature,
                address: votingMachineEvent.address,
                beneficiary: votingMachineEvent.returnValues._beneficiary,
                amount: votingMachineEvent.returnValues._amount,
                proposalId: votingMachineEvent.returnValues._proposalId,
                tx: votingMachineEvent.transactionHash,
                blockNumber: votingMachineEvent.blockNumber,
                timestamp: votingMachineEvent.timestamp,
                transactionIndex: votingMachineEvent.transactionIndex,
                logIndex: votingMachineEvent.logIndex,
              });
            break;
          case 'RedeemReputation':
            votingMachineEventsInCache.redeemsRep.push({
              event: votingMachineEvent.event,
              signature: votingMachineEvent.signature,
              address: votingMachineEvent.address,
              beneficiary: votingMachineEvent.returnValues._beneficiary,
              amount: votingMachineEvent.returnValues._amount,
              proposalId: votingMachineEvent.returnValues._proposalId,
              tx: votingMachineEvent.transactionHash,
              blockNumber: votingMachineEvent.blockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
            break;
          case 'RedeemDaoBounty':
            votingMachineEventsInCache.redeemsDaoBounty.push({
              event: votingMachineEvent.event,
              signature: votingMachineEvent.signature,
              address: votingMachineEvent.address,
              beneficiary: votingMachineEvent.returnValues._beneficiary,
              amount: votingMachineEvent.returnValues._amount,
              proposalId: votingMachineEvent.returnValues._proposalId,
              tx: votingMachineEvent.transactionHash,
              blockNumber: votingMachineEvent.blockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
            break;
        }
    });
    networkCache.votingMachines[votingMachine._address].events =
      votingMachineEventsInCache;

    return networkCache;
  }

  // Gets all the events form the permission registry and stores the permissions set.
  async updatePermissionRegistry(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const fromBlock = networkCache.blockNumber + 1;

    if (networkWeb3Contracts.permissionRegistry._address !== ZERO_ADDRESS) {
      let permissionRegistryEvents = await getEvents(
        web3,
        networkWeb3Contracts.permissionRegistry,
        fromBlock,
        toBlock,
        'allEvents'
      );

      permissionRegistryEvents.map(permissionRegistryEvent => {
        const eventValues = permissionRegistryEvent.returnValues;

        if (!networkCache.callPermissions[eventValues.asset])
          networkCache.callPermissions[eventValues.asset] = {};

        if (!networkCache.callPermissions[eventValues.asset][eventValues.from])
          networkCache.callPermissions[eventValues.asset][eventValues.from] =
            {};

        if (
          !networkCache.callPermissions[eventValues.asset][eventValues.from][
            eventValues.to
          ]
        )
          networkCache.callPermissions[eventValues.asset][eventValues.from][
            eventValues.to
          ] = {};

        networkCache.callPermissions[eventValues.asset][eventValues.from][
          eventValues.to
        ][eventValues.functionSignature] = {
          value: eventValues.value,
          fromTime: eventValues.fromTime,
        };
      });
    }

    return networkCache;
  }

  /**
   * @function updateVestingContracts
   * @description Get all "VestingCreated" events from VestingFactory contract and store created TokenVesting contract info into cache.
   */

  async updateVestingContracts(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const fromBlock = networkCache.blockNumber + 1;

    if (networkWeb3Contracts.vestingFactory) {
      try {
        const vestingFactoryEvents = await getEvents(
          web3,
          networkWeb3Contracts.vestingFactory,
          fromBlock,
          toBlock,
          'allEvents'
        );

        console.debug(
          'Total VestingFactory "VestingCreated" Events: ',
          vestingFactoryEvents.length
        );

        for (let event of vestingFactoryEvents) {
          const callsToExecute = [
            [
              event.returnValues.vestingContractAddress,
              'beneficiary()',
              [],
              ['address'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'cliff()',
              [],
              ['uint256'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'duration()',
              [],
              ['uint256'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'owner()',
              [],
              ['address'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'start()',
              [],
              ['uint256'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'isOwner()',
              [],
              ['bool'],
            ],
            [
              event.returnValues.vestingContractAddress,
              'revocable()',
              [],
              ['bool'],
            ],
          ];

          const callsResponse = await executeMulticall(
            networkWeb3Contracts.multicall,
            callsToExecute
          );

          const tokenContractInfo = {
            address: event.returnValues.vestingContractAddress,
            beneficiary: callsResponse.decodedReturnData[0][0],
            cliff: callsResponse.decodedReturnData[1][0],
            duration: callsResponse.decodedReturnData[2][0],
            owner: callsResponse.decodedReturnData[3][0],
            start: callsResponse.decodedReturnData[4][0],
            isOwner: callsResponse.decodedReturnData[5][0],
            revocable: callsResponse.decodedReturnData[6][0],
          };

          networkCache.vestingContracts = [
            ...(networkCache.vestingContracts ?? []),
            tokenContractInfo,
          ];
        }
      } catch (error) {
        console.error('Error in updateVestingContracts', error);
      }
    }

    return networkCache;
  }

  // Update all the schemes information
  async updateSchemes(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const fromBlock = networkCache.blockNumber + 1;

    // Get all the events from the Controller
    let controllerEvents = await getEvents(
      web3,
      networkWeb3Contracts.controller,
      fromBlock,
      toBlock,
      'allEvents'
    );

    await batchPromisesOntarget(
      controllerEvents
        .filter(controllerEvent => {
          return (
            (controllerEvent.event === 'UnregisterScheme' ||
              controllerEvent.event === 'RegisterScheme') &&
            controllerEvent.returnValues._sender !==
              controllerEvent.returnValues._scheme
          );
        })
        .map(controllerEvent => {
          console.log(controllerEvent);
          return this.processScheme(
            controllerEvent.returnValues._scheme,
            networkCache,
            networkContracts,
            web3,
            controllerEvent.event === 'UnregisterScheme'
          );
        }),
      networkCache,
      5
    );

    await batchPromisesOntarget(
      Object.keys(networkCache.schemes)
        .filter(schemeAddress => {
          return networkCache.schemes[schemeAddress].registered;
        })
        .map(schemeAddress => {
          return this.processScheme(
            schemeAddress,
            networkCache,
            networkContracts,
            web3
          );
        }),
      networkCache,
      5
    );

    return networkCache;
  }

  // Update all the proposals information
  async updateProposals(
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    toBlock: number,
    web3: Web3
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const avatarAddress = networkWeb3Contracts.avatar._address;
    const avatarAddressEncoded = web3.eth.abi.encodeParameter(
      'address',
      avatarAddress
    );
    const fromBlock = networkCache.blockNumber + 1;

    // Get new proposals
    // TO DO: Get only proposals from registered schemes, change registered to block number of unregisterScheme
    await Promise.all(
      Object.keys(networkCache.schemes).map(async schemeAddress => {
        const schemeTypeData = getSchemeConfig(networkContracts, schemeAddress);
        let schemeEvents = [];
        for (let i = 0; i < schemeTypeData.newProposalTopics.length; i++) {
          schemeEvents = schemeEvents.concat(
            await getRawEvents(
              web3,
              schemeAddress,
              fromBlock,
              toBlock,
              schemeTypeData.newProposalTopics[i]
            )
          );
        }

        await batchPromisesOntarget(
          schemeEvents.map(schemeEvent => {
            const proposalId: string =
              schemeEvent.topics[1] === avatarAddressEncoded
                ? schemeEvent.topics[2]
                : schemeEvent.topics[1];

            return this.processProposal(
              proposalId,
              networkCache,
              networkContracts,
              web3,
              fromBlock,
              toBlock,
              schemeEvent
            );
          }),
          networkCache,
          50
        );
      })
    );

    // Update existent active proposals
    await batchPromisesOntarget(
      Object.keys(networkCache.proposals)
        .filter(proposalId => {
          return (
            networkCache.proposals[proposalId].stateInVotingMachine >
              VotingMachineProposalState.Executed ||
            networkCache.proposals[proposalId].stateInScheme ===
              WalletSchemeProposalState.Submitted
          );
        })
        .map(proposalId => {
          return this.processProposal(
            proposalId,
            networkCache,
            networkContracts,
            web3,
            fromBlock,
            toBlock
          );
        }),
      networkCache,
      5
    );

    return networkCache;
  }

  async updateProposalTitles(
    networkCache: DaoNetworkCache,
    proposalTitles: Record<string, string>
  ) {
    let retryIntent = 0;
    // Update proposals title
    for (
      let proposalIndex = 0;
      proposalIndex < Object.keys(networkCache.proposals).length;
      proposalIndex++
    ) {
      const proposal =
        networkCache.proposals[
          Object.keys(networkCache.proposals)[proposalIndex]
        ];
      const ipfsHash = descriptionHashToIPFSHash(proposal.descriptionHash);

      // TODO: Move this somewhere else later.
      const invalidTitleProposals = [
        '0xbd5a578170b28eedb9ed05adcd7a904180a18178a7fee5627640bce217601f60',
        '0x216c41327eb0d8e6b64018626193d132d379b43b9b031720ee6a11494ad400a7',
        '0xfb15b6f9e3bf61099d20bb3b39375d4e2a6f7ac3c72179537ce147ed991d61b4',
        '0x1e6c8f56755897b1aea4f47b009095e9bee23714a87094b48dbb78c8744fd5b2',
        '0x4cbdd4c473e3c2dc6090cd2842b6884770406a43dd96d1abe36167b7437d9bec',
        '0x5016d176a2004ff7dfd1a3bf358f2d73c57d9e4b2e64053888f77a2e3555f101',

        // TODO: Fix this xdai proposal IPFS content
        '0xfb15b6f9e3bf61099d20bb3b39375d4e2a6f7ac3c72179537ce147ed991d61b4',
      ];

      // If the script is running on the client side and it already tried once, or has the title, continue.
      if (
        invalidTitleProposals.indexOf(proposal.id) > -1 ||
        retryIntent > 3 ||
        proposal.title
      ) {
        retryIntent = 0;
        continue;
      }

      if (
        !proposalTitles[proposal.id] &&
        !isWalletScheme(networkCache.schemes[proposal.scheme]) &&
        proposal.descriptionHash &&
        proposal.descriptionHash.length > 0 &&
        // Try to get title if cache is running in node script or if proposal was submitted in last 100000 blocks
        proposal.title?.length === 0
      )
        try {
          console.debug(
            `Getting title from proposal ${proposal.id} with ipfsHash ${ipfsHash}`
          );
          const response = await getIPFSFile(ipfsHash);
          if (response && response.data && response.data.title) {
            proposalTitles[proposal.id] = response.data.title;
          } else {
            console.warn(
              `Couldnt not get title from proposal ${proposal.id} with ipfsHash ${ipfsHash}`
            );
          }
        } catch (error) {
          if (
            (error as Error).message === 'Request failed with status code 429'
          ) {
            console.error(
              `Request failed with status code 429 waiting 10 second and trying again..`
            );
            await sleep(10000);
          } else {
            console.error(
              `Error getting title from proposal ${proposal.id} with hash ${ipfsHash} waiting 1 second and trying again..`
            );
            await sleep(1000);
          }
          proposalIndex--;
          retryIntent++;
        }
    }

    return proposalTitles;
  }

  // Update all the schemes information
  async processScheme(
    schemeAddress: string,
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    web3: Web3,
    removeScheme: boolean = false
  ): Promise<DaoNetworkCache> {
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const isNewScheme = !networkCache.schemes[schemeAddress];
    const schemeTypeData = getSchemeConfig(networkContracts, schemeAddress);
    console.debug(
      'Processing Scheme',
      schemeAddress,
      schemeTypeData,
      removeScheme
    );

    let controllerAddress = networkWeb3Contracts.controller._address;
    let schemeName = schemeTypeData.name;
    let maxSecondsForExecution = 0;
    let maxRepPercentageChange = 0;
    let schemeType = schemeTypeData.type;
    const isWalletScheme = schemeType === 'WalletScheme';

    let callsToExecute = [
      [
        controllerAddress,
        'getSchemePermissions(address,address)',
        [schemeAddress, networkWeb3Contracts.avatar._address],
        ['bytes4'],
      ],
      [
        controllerAddress,
        'getSchemeParameters(address,address)',
        [schemeAddress, networkWeb3Contracts.avatar._address],
        ['bytes32'],
      ],
    ];

    if (isNewScheme && isWalletScheme) {
      schemeType = (
        await executeMulticall(networkWeb3Contracts.multicall, [
          [schemeAddress, 'SCHEME_TYPE()', [], ['string']],
        ])
      ).decodedReturnData[0][0];
      if (schemeType === 'Wallet Scheme v1') schemeType = 'Wallet Scheme v1.0';

      callsToExecute.push([schemeAddress, 'votingMachine()', [], ['address']]);
      callsToExecute.push([schemeAddress, 'schemeName()', [], ['string']]);
      callsToExecute.push([
        schemeAddress,
        'maxSecondsForExecution()',
        [],
        ['uint256'],
      ]);
      callsToExecute.push([
        schemeAddress,
        'maxRepPercentageChange()',
        [],
        ['uint256'],
      ]);

      switch (schemeType) {
        case 'Wallet Scheme v1.0':
          callsToExecute.push([
            schemeAddress,
            'controllerAddress()',
            [],
            ['address'],
          ]);
          break;
        default:
          callsToExecute.push([
            schemeAddress,
            'doAvatarGenericCalls()',
            [],
            ['bool'],
          ]);
          break;
      }
    }

    const callsResponse1 = await executeMulticall(
      networkWeb3Contracts.multicall,
      callsToExecute
    );

    const permissions = decodePermission(
      callsResponse1.decodedReturnData[0][0]
    );
    const paramsHash =
      schemeTypeData.voteParams || callsResponse1.decodedReturnData[1][0];

    const votingMachineAddress = !isNewScheme
      ? networkCache.schemes[schemeAddress].votingMachine
      : isWalletScheme
      ? callsResponse1.decodedReturnData[2][0]
      : schemeTypeData.votingMachine;

    if (isNewScheme && isWalletScheme) {
      schemeName = callsResponse1.decodedReturnData[3][0];
      maxSecondsForExecution = callsResponse1.decodedReturnData[4][0];
      maxRepPercentageChange = callsResponse1.decodedReturnData[5][0];

      switch (schemeType) {
        case 'Wallet Scheme v1.0':
          controllerAddress = callsResponse1.decodedReturnData[6][0];
          break;
        default:
          controllerAddress = callsResponse1.decodedReturnData[6][0]
            ? networkWeb3Contracts.controller._address
            : ZERO_ADDRESS;
          break;
      }
    }

    callsToExecute = [
      [
        votingMachineAddress,
        'orgBoostedProposalsCnt(bytes32)',
        [
          web3.utils.soliditySha3(
            schemeAddress,
            networkWeb3Contracts.avatar._address
          ),
        ],
        ['uint256'],
      ],
    ];

    // Register the new voting parameters in the voting machine params
    if (
      !networkCache.votingMachines[votingMachineAddress].votingParameters[
        paramsHash
      ]
    ) {
      callsToExecute.push([
        votingMachineAddress,
        'parameters(bytes32)',
        [paramsHash],
        [
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'address',
        ],
      ]);
    }

    if (isWalletScheme) {
      callsToExecute.push([
        votingMachineAddress,
        'boostedVoteRequiredPercentage(bytes32,bytes32)',
        [
          web3.utils.soliditySha3(
            schemeAddress,
            networkWeb3Contracts.avatar._address
          ),
          paramsHash,
        ],
        ['uint256'],
      ]);
    }

    const callsResponse2 = await executeMulticall(
      networkWeb3Contracts.multicall,
      callsToExecute
    );

    const boostedProposals = callsResponse2.decodedReturnData[0][0];

    if (
      !networkCache.votingMachines[votingMachineAddress].votingParameters[
        paramsHash
      ]
    ) {
      networkCache.votingMachines[votingMachineAddress].votingParameters[
        paramsHash
      ] = {
        queuedVoteRequiredPercentage: callsResponse2.decodedReturnData[1][0],
        queuedVotePeriodLimit: callsResponse2.decodedReturnData[1][1],
        boostedVotePeriodLimit: callsResponse2.decodedReturnData[1][2],
        preBoostedVotePeriodLimit: callsResponse2.decodedReturnData[1][3],
        thresholdConst: callsResponse2.decodedReturnData[1][4],
        limitExponentValue: callsResponse2.decodedReturnData[1][5],
        quietEndingPeriod: callsResponse2.decodedReturnData[1][6],
        proposingRepReward: callsResponse2.decodedReturnData[1][7],
        votersReputationLossRatio: callsResponse2.decodedReturnData[1][8],
        minimumDaoBounty: callsResponse2.decodedReturnData[1][9],
        daoBountyConst: callsResponse2.decodedReturnData[1][10],
        activationTime: callsResponse2.decodedReturnData[1][11],
      };
    }

    const boostedVoteRequiredPercentage = isWalletScheme
      ? callsResponse2.decodedReturnData[callsToExecute.length - 1][0]
      : 0;

    if (isNewScheme) {
      networkCache.schemes[schemeAddress] = {
        address: schemeAddress,
        registered: true,
        controllerAddress,
        name: schemeName,
        type: schemeType,
        votingMachine: votingMachineAddress,
        paramsHash: paramsHash,
        permissions,
        boostedVoteRequiredPercentage,
        proposalIds: [],
        boostedProposals: boostedProposals,
        maxSecondsForExecution: maxSecondsForExecution,
        maxRepPercentageChange,
        newProposalEvents: [],
      };
    } else {
      networkCache.schemes[schemeAddress].boostedProposals = boostedProposals;
      networkCache.schemes[schemeAddress].maxSecondsForExecution =
        maxSecondsForExecution;
      networkCache.schemes[schemeAddress].boostedVoteRequiredPercentage =
        boostedVoteRequiredPercentage;
      networkCache.schemes[schemeAddress].paramsHash = paramsHash;
      networkCache.schemes[schemeAddress].permissions = permissions;
      networkCache.schemes[schemeAddress].registered = !removeScheme;
    }

    return networkCache;
  }

  async processProposal(
    proposalId: string,
    networkCache: DaoNetworkCache,
    networkContracts: NetworkContracts,
    web3: Web3,
    fromBlock: number,
    toBlock: number,
    creationEvent?: any
  ): Promise<DaoNetworkCache> {
    const newProposal = !networkCache.proposals[proposalId];
    const schemeAddress = newProposal
      ? creationEvent.address
      : networkCache.proposals[proposalId].scheme;
    const schemeOfProposal = networkCache.schemes[schemeAddress];
    const avatarAddress = networkCache.address;
    const schemeTypeData = getSchemeConfig(networkContracts, schemeAddress);
    const networkWeb3Contracts = await getContracts(networkContracts, web3);
    const avatarAddressEncoded = web3.eth.abi.encodeParameter(
      'address',
      avatarAddress
    );

    let callsToExecute: any[] = [
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'proposals(bytes32)',
        [proposalId],
        [
          { type: 'bytes32', name: 'organizationId' },
          { type: 'address', name: 'callbacks' },
          { type: 'uint256', name: 'state' },
          { type: 'uint256', name: 'winningVote' },
          { type: 'address', name: 'proposer' },
          {
            type: 'uint256',
            name: 'currentBoostedVotePeriodLimit',
          },
          { type: 'bytes32', name: 'paramsHash' },
          { type: 'uint256', name: 'daoBountyRemain' },
          { type: 'uint256', name: 'daoBounty' },
          { type: 'uint256', name: 'totalStakes' },
          { type: 'uint256', name: 'confidenceThreshold' },
          {
            type: 'uint256',
            name: 'secondsFromTimeOutTillExecuteBoosted',
          },
        ],
      ],
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'voteStatus(bytes32,uint256)',
        [proposalId, 1],
        ['uint256'],
      ],
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'voteStatus(bytes32,uint256)',
        [proposalId, 2],
        ['uint256'],
      ],
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'proposalStatus(bytes32)',
        [proposalId],
        ['uint256', 'uint256', 'uint256', 'uint256'],
      ],
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'getProposalTimes(bytes32)',
        [proposalId],
        ['uint256', 'uint256', 'uint256'],
      ],
      [
        networkCache.schemes[schemeAddress].votingMachine,
        'shouldBoost(bytes32)',
        [proposalId],
        ['bool'],
      ],
    ];

    if (schemeTypeData.type === 'ContributionReward') {
      callsToExecute.push([
        schemeAddress,
        'getRedeemedPeriods(bytes32,address,uint256)',
        [proposalId, schemeAddress, 0],
        ['uint256'],
      ]);
      callsToExecute.push([
        schemeAddress,
        'getRedeemedPeriods(bytes32,address,uint256)',
        [proposalId, avatarAddress, 1],
        ['uint256'],
      ]);
      callsToExecute.push([
        schemeAddress,
        'getRedeemedPeriods(bytes32,address,uint256)',
        [proposalId, avatarAddress, 2],
        ['uint256'],
      ]);
      callsToExecute.push([
        schemeAddress,
        'getRedeemedPeriods(bytes32,address,uint256)',
        [proposalId, avatarAddress, 3],
        ['uint256'],
      ]);
    } else if (isWalletScheme(schemeOfProposal)) {
      callsToExecute.push([
        schemeAddress,
        'getOrganizationProposal(bytes32)',
        [proposalId],
        [
          { type: 'address[]', name: 'to' },
          { type: 'bytes[]', name: 'callData' },
          { type: 'uint256[]', name: 'value' },
          { type: 'uint256', name: 'state' },
          { type: 'string', name: 'title' },
          { type: 'string', name: 'descriptionHash' },
          { type: 'uint256', name: 'submittedTime' },
        ],
      ]);
    }

    const callsResponse = await executeMulticall(
      networkWeb3Contracts.multicall,
      callsToExecute
    );

    const positiveVotes = callsResponse.decodedReturnData[1][0];
    const negativeVotes = callsResponse.decodedReturnData[2][0];
    const proposalTimes = callsResponse.decodedReturnData[4];

    let schemeProposalInfo = {
      to: [],
      callData: [],
      value: [],
      state: WalletSchemeProposalState.Submitted,
      title: '',
      descriptionHash: '',
      submittedTime: 0,
    };
    let decodedProposer;
    let creationLogDecoded;

    if (newProposal && isWalletScheme(schemeOfProposal)) {
      // @ts-ignore
      schemeProposalInfo.to = callsResponse.decodedReturnData[6].to;
      schemeProposalInfo.callData = callsResponse.decodedReturnData[6].callData;
      schemeProposalInfo.value = callsResponse.decodedReturnData[6].value;
      schemeProposalInfo.state = callsResponse.decodedReturnData[6].state;
      schemeProposalInfo.title = callsResponse.decodedReturnData[6].title;
      schemeProposalInfo.descriptionHash =
        callsResponse.decodedReturnData[6].descriptionHash;
      schemeProposalInfo.submittedTime =
        callsResponse.decodedReturnData[6].submittedTime;
    } else if (isWalletScheme(schemeOfProposal)) {
      schemeProposalInfo.state = callsResponse.decodedReturnData[6].state;
    } else {
      if (schemeOfProposal.type === 'GenericMulticall') {
        // event ProposalExecutedByVotingMachine(
        //     address indexed _avatar,
        //     bytes32 indexed _proposalId,
        //     int256 _param
        // );
        const votingMachineExecutionEvent =
          schemeProposalInfo.state === WalletSchemeProposalState.Submitted
            ? await getRawEvents(
                web3,
                schemeAddress,
                fromBlock,
                toBlock,
                [
                  '0x25d4c89430c1f10c60c292556941e3e624ec1ec04972a5da46cee1b352429cbe',
                  avatarAddressEncoded,
                  proposalId,
                ],
                10000000
              )
            : [];

        if (
          votingMachineExecutionEvent.length > 0 &&
          votingMachineExecutionEvent[0].data ===
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        )
          schemeProposalInfo.state = WalletSchemeProposalState.Submitted;
        else if (votingMachineExecutionEvent.length > 0) {
          schemeProposalInfo.state = WalletSchemeProposalState.Rejected;
        }

        const executionEvent = await getRawEvents(
          web3,
          schemeAddress,
          fromBlock,
          toBlock,
          [
            '0x253ad9614c337848bbe7dc3b18b439d139ef5787282b5a517ba7296513d1f533',
            avatarAddressEncoded,
            proposalId,
          ],
          10000000
        );
        if (executionEvent.length > 0) {
          schemeProposalInfo.state =
            WalletSchemeProposalState.ExecutionSucceded;
        }
      } else if (schemeOfProposal.type === 'ContributionReward') {
        if (
          callsResponse.decodedReturnData[6][0] > 0 ||
          callsResponse.decodedReturnData[7][0] > 0 ||
          callsResponse.decodedReturnData[8][0] > 0 ||
          callsResponse.decodedReturnData[9][0] > 0
        ) {
          schemeProposalInfo.state =
            WalletSchemeProposalState.ExecutionSucceded;
        } else if (
          callsResponse.decodedReturnData[0].state === '1' ||
          callsResponse.decodedReturnData[0].state === '2'
        ) {
          schemeProposalInfo.state = WalletSchemeProposalState.Rejected;
        } else {
          schemeProposalInfo.state = WalletSchemeProposalState.Submitted;
        }
      }
    }

    // If the proposal is processed with a creation event it means that it has to be added to the cache
    if (newProposal) {
      if (creationEvent && !isWalletScheme(schemeOfProposal)) {
        const transactionReceipt = await web3.eth.getTransactionReceipt(
          creationEvent.transactionHash
        );
        try {
          schemeTypeData.newProposalTopics.map((newProposalTopic, i) => {
            transactionReceipt.logs.map(log => {
              if (
                log.topics[0] ===
                '0x75b4ff136cc5de5957574c797de3334eb1c141271922b825eb071e0487ba2c5c'
              ) {
                decodedProposer = web3.eth.abi.decodeParameters(
                  [
                    { type: 'uint256', name: '_numOfChoices' },
                    { type: 'address', name: '_proposer' },
                    { type: 'bytes32', name: '_paramsHash' },
                  ],
                  log.data
                )._proposer;
              }
              if (
                !creationLogDecoded &&
                log.topics[0] === newProposalTopic[0]
              ) {
                creationLogDecoded = web3.eth.abi.decodeParameters(
                  schemeTypeData.creationLogEncoding[i],
                  log.data
                );
                if (
                  creationLogDecoded._descriptionHash.length > 0 &&
                  creationLogDecoded._descriptionHash !== ZERO_HASH
                ) {
                  schemeProposalInfo.descriptionHash =
                    ipfsHashToDescriptionHash(
                      creationLogDecoded._descriptionHash
                    );
                }
              }
            });
          });
        } catch (error) {
          console.error(
            'Error in getting proposal data from creation event',
            error
          );
        }
      }

      if (schemeTypeData.type === 'SchemeRegistrar') {
        schemeProposalInfo.to = [schemeTypeData.contractToCall];
        schemeProposalInfo.value = [0];

        if (creationLogDecoded._parametersHash) {
          schemeProposalInfo.callData = [
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'registerScheme',
                type: 'function',
                inputs: [
                  { type: 'address', name: '_scheme' },
                  { type: 'bytes32', name: '_paramsHash' },
                  { type: 'bytes4', name: '_permissions' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded['_scheme '],
                creationLogDecoded._parametersHash,
                creationLogDecoded._permissions,
                avatarAddress,
              ]
            ),
          ];
        } else {
          schemeProposalInfo.callData = [
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'unregisterScheme',
                type: 'function',
                inputs: [
                  { type: 'address', name: '_scheme' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [creationLogDecoded['_scheme '], avatarAddress]
            ),
          ];
        }
      } else if (schemeTypeData.type === 'ContributionReward') {
        if (creationLogDecoded._reputationChange > 0) {
          schemeProposalInfo.to.push(schemeTypeData.contractToCall);
          schemeProposalInfo.value.push(0);
          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'mintReputation',
                type: 'function',
                inputs: [
                  { type: 'uint256', name: '_amount' },
                  { type: 'address', name: '_to' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded._reputationChange,
                creationLogDecoded._beneficiary,
                avatarAddress,
              ]
            )
          );
        } else if (creationLogDecoded._reputationChange < 0) {
          schemeProposalInfo.to.push(schemeTypeData.contractToCall);
          schemeProposalInfo.value.push(0);

          // Remove the negative sign in the number
          if (creationLogDecoded._reputationChange[0] == '-')
            creationLogDecoded._reputationChange =
              creationLogDecoded._reputationChange.substring(1);

          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'burnReputation',
                type: 'function',
                inputs: [
                  { type: 'uint256', name: '_amount' },
                  { type: 'address', name: '_from' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded._reputationChange,
                creationLogDecoded._beneficiary,
                avatarAddress,
              ]
            )
          );
        }

        if (creationLogDecoded._rewards[0] > 0) {
          schemeProposalInfo.to.push(schemeTypeData.contractToCall);
          schemeProposalInfo.value.push(0);
          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'mintTokens',
                type: 'function',
                inputs: [
                  { type: 'uint256', name: '_amount' },
                  { type: 'address', name: '_beneficiary' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded._rewards[0],
                creationLogDecoded._beneficiary,
                avatarAddress,
              ]
            )
          );
        }

        if (creationLogDecoded._rewards[1] > 0) {
          schemeProposalInfo.to.push(schemeTypeData.contractToCall);
          schemeProposalInfo.value.push(0);
          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'sendEther',
                type: 'function',
                inputs: [
                  { type: 'uint256', name: '_amountInWei' },
                  { type: 'address', name: '_to' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded._rewards[1],
                creationLogDecoded._beneficiary,
                avatarAddress,
              ]
            )
          );
        }

        if (creationLogDecoded._rewards[2] > 0) {
          schemeProposalInfo.to.push(schemeTypeData.contractToCall);
          schemeProposalInfo.value.push(0);
          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'externalTokenTransfer',
                type: 'function',
                inputs: [
                  { type: 'address', name: '_externalToken' },
                  { type: 'address', name: '_to' },
                  { type: 'uint256', name: '_value' },
                  { type: 'address', name: '_avatar' },
                ],
              },
              [
                creationLogDecoded._externalToken,
                creationLogDecoded._beneficiary,
                creationLogDecoded._rewards[2],
                avatarAddress,
              ]
            )
          );
        }
      } else if (schemeTypeData.type === 'GenericScheme') {
        schemeProposalInfo.to = [networkWeb3Contracts.controller._address];
        schemeProposalInfo.value = [0];
        schemeProposalInfo.callData = [
          web3.eth.abi.encodeFunctionCall(
            {
              name: 'genericCall',
              type: 'function',
              inputs: [
                { type: 'address', name: '_contract' },
                { type: 'bytes', name: '_data' },
                { type: 'address', name: '_avatar' },
                { type: 'uint256', name: '_value' },
              ],
            },
            [
              schemeTypeData.contractToCall,
              creationLogDecoded._data,
              avatarAddress,
              creationLogDecoded._value,
            ]
          ),
        ];
      } else if (schemeTypeData.type === 'GenericMulticall') {
        for (
          let callIndex = 0;
          callIndex < creationLogDecoded._contractsToCall.length;
          callIndex++
        ) {
          schemeProposalInfo.to.push(networkWeb3Contracts.controller._address);
          schemeProposalInfo.value.push(0);
          schemeProposalInfo.callData.push(
            web3.eth.abi.encodeFunctionCall(
              {
                name: 'genericCall',
                type: 'function',
                inputs: [
                  { type: 'address', name: '_contract' },
                  { type: 'bytes', name: '_data' },
                  { type: 'address', name: '_avatar' },
                  { type: 'uint256', name: '_value' },
                ],
              },
              [
                creationLogDecoded._contractsToCall[callIndex],
                creationLogDecoded._callsData[callIndex],
                avatarAddress,
                creationLogDecoded._values[callIndex],
              ]
            )
          );
        }
      }

      // Register the new voting parameters in the voting machine params
      if (
        !networkCache.votingMachines[
          networkCache.schemes[schemeAddress].votingMachine
        ].votingParameters[callsResponse.decodedReturnData[0].paramsHash]
      ) {
        const votingParameters = (
          await executeMulticall(networkWeb3Contracts.multicall, [
            [
              networkCache.schemes[schemeAddress].votingMachine,
              'parameters(bytes32)',
              [callsResponse.decodedReturnData[0].paramsHash],
              [
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'address',
              ],
            ],
          ])
        ).decodedReturnData[0];
        networkCache.votingMachines[
          networkCache.schemes[schemeAddress].votingMachine
        ].votingParameters[callsResponse.decodedReturnData[0].paramsHash] = {
          queuedVoteRequiredPercentage: votingParameters[0],
          queuedVotePeriodLimit: votingParameters[1],
          boostedVotePeriodLimit: votingParameters[2],
          preBoostedVotePeriodLimit: votingParameters[3],
          thresholdConst: votingParameters[4],
          limitExponentValue: votingParameters[5],
          quietEndingPeriod: votingParameters[6],
          proposingRepReward: votingParameters[7],
          votersReputationLossRatio: votingParameters[8],
          minimumDaoBounty: votingParameters[9],
          daoBountyConst: votingParameters[10],
          activationTime: votingParameters[11],
        };
      }

      networkCache.proposals[proposalId] = {
        id: proposalId,
        scheme: schemeAddress,
        to: schemeProposalInfo.to,
        title: schemeProposalInfo.title || '',
        callData: schemeProposalInfo.callData,
        values: schemeProposalInfo.value.map(value => bnum(value)),
        stateInScheme: Number(schemeProposalInfo.state),
        stateInVotingMachine: Number(callsResponse.decodedReturnData[0].state),
        descriptionHash: schemeProposalInfo.descriptionHash,
        creationEvent: {
          event: creationEvent.event,
          signature: creationEvent.signature,
          address: creationEvent.address,
          tx: creationEvent.transactionHash,
          blockNumber: creationEvent.blockNumber,
          timestamp: creationEvent.timestamp,
          transactionIndex: creationEvent.transactionIndex,
          logIndex: creationEvent.logIndex,
        },
        winningVote: callsResponse.decodedReturnData[0].winningVote,
        proposer: decodedProposer
          ? decodedProposer
          : callsResponse.decodedReturnData[0].proposer,
        currentBoostedVotePeriodLimit:
          callsResponse.decodedReturnData[0].currentBoostedVotePeriodLimit,
        paramsHash: callsResponse.decodedReturnData[0].paramsHash,
        daoBountyRemain: bnum(
          callsResponse.decodedReturnData[0].daoBountyRemain
        ),
        daoBounty: bnum(callsResponse.decodedReturnData[0].daoBounty),
        confidenceThreshold:
          callsResponse.decodedReturnData[0].confidenceThreshold,
        secondsFromTimeOutTillExecuteBoosted:
          callsResponse.decodedReturnData[0]
            .secondsFromTimeOutTillExecuteBoosted,
        submittedTime: bnum(proposalTimes[0]),
        boostedPhaseTime: bnum(proposalTimes[1]),
        preBoostedPhaseTime: bnum(proposalTimes[2]),
        daoRedeemItsWinnings:
          callsResponse.decodedReturnData[0].daoRedeemItsWinnings,
        shouldBoost: callsResponse.decodedReturnData[5][0],
        positiveVotes: bnum(positiveVotes),
        negativeVotes: bnum(negativeVotes),
        positiveStakes: bnum(callsResponse.decodedReturnData[3][2]),
        negativeStakes: bnum(callsResponse.decodedReturnData[3][3]),
      };

      networkCache.schemes[schemeAddress].proposalIds.push(proposalId);
      networkCache.schemes[schemeAddress].newProposalEvents.push({
        proposalId: proposalId,
        event: creationEvent.event,
        signature: creationEvent.signature,
        address: creationEvent.address,
        tx: creationEvent.transactionHash,
        blockNumber: creationEvent.blockNumber,
        timestamp: creationEvent.timestamp,
        transactionIndex: creationEvent.transactionIndex,
        logIndex: creationEvent.logIndex,
      });

      if (schemeProposalInfo.descriptionHash.length > 1) {
        networkCache.ipfsHashes.push({
          hash: descriptionHashToIPFSHash(schemeProposalInfo.descriptionHash),
          type: 'proposal',
          name: proposalId,
        });
      }
    } else {
      networkCache.proposals[proposalId].stateInScheme = Number(
        schemeProposalInfo.state
      );
      networkCache.proposals[proposalId].stateInVotingMachine = Number(
        callsResponse.decodedReturnData[0].state
      );
      networkCache.proposals[proposalId].winningVote =
        callsResponse.decodedReturnData[0].winningVote;
      networkCache.proposals[proposalId].currentBoostedVotePeriodLimit =
        callsResponse.decodedReturnData[0].currentBoostedVotePeriodLimit;
      networkCache.proposals[proposalId].daoBountyRemain = bnum(
        callsResponse.decodedReturnData[0].daoBountyRemain
      );
      networkCache.proposals[proposalId].daoBounty = bnum(
        callsResponse.decodedReturnData[0].daoBounty
      );
      networkCache.proposals[proposalId].confidenceThreshold =
        callsResponse.decodedReturnData[0].confidenceThreshold;
      networkCache.proposals[proposalId].secondsFromTimeOutTillExecuteBoosted =
        callsResponse.decodedReturnData[0].secondsFromTimeOutTillExecuteBoosted;
      networkCache.proposals[proposalId].boostedPhaseTime = bnum(
        proposalTimes[1]
      );
      networkCache.proposals[proposalId].preBoostedPhaseTime = bnum(
        proposalTimes[2]
      );
      networkCache.proposals[proposalId].daoRedeemItsWinnings =
        callsResponse.decodedReturnData[0].daoRedeemItsWinnings;
      networkCache.proposals[proposalId].shouldBoost =
        callsResponse.decodedReturnData[5][0];
      networkCache.proposals[proposalId].positiveVotes = bnum(positiveVotes);
      networkCache.proposals[proposalId].negativeVotes = bnum(negativeVotes);
      networkCache.proposals[proposalId].positiveStakes = bnum(
        callsResponse.decodedReturnData[3][2]
      );
      networkCache.proposals[proposalId].negativeStakes = bnum(
        callsResponse.decodedReturnData[3][3]
      );
    }
    return networkCache;
  }
}
