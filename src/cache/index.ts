import axios from 'axios';
import {
  bnum,
  ZERO_HASH,
  ZERO_ADDRESS,
  sleep,
  decodePermission,
  WalletSchemeProposalState,
  VotingMachineProposalState,
  tryCacheUpdates,
  isWalletScheme,
} from '../utils';
import {
  getEvents,
  getRawEvents,
  sortEvents,
  executeMulticall,
  isNode,
  descriptionHashToIPFSHash,
  ipfsHashToDescriptionHash,
  getSchemeTypeData,
} from '../utils/cache';
import WalletScheme1_0JSON from '../contracts/WalletScheme1_0.json';
import WalletScheme1_1JSON from '../contracts/WalletScheme1_1.json';
import ContributionRewardJSON from '../contracts/ContributionReward.json';
import TokenVestingJSON from '../contracts/TokenVesting.json';
import { getContracts } from '../contracts';
import RootContext from '../contexts';

export const getUpdatedCache = async function (
  context: RootContext,
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const notificationStore = isNode() ? null : context.notificationStore;

  console.debug(`[CACHE UPDATE] from ${fromBlock} to ${toBlock}`);
  const networkWeb3Contracts = await getContracts(networkContractsConfig, web3);

  if (notificationStore)
    notificationStore.setGlobalLoading(
      true,
      `Collecting reputation events for blocks ${fromBlock} - ${toBlock}`
    );

  networkCache = await tryCacheUpdates(
    [
      updateDaoInfo(networkCache, networkWeb3Contracts, web3),
      updateReputationEvents(
        networkCache,
        networkWeb3Contracts.reputation,
        fromBlock,
        toBlock,
        web3
      ),
    ],
    networkCache
  );

  if (notificationStore)
    notificationStore.setGlobalLoading(
      true,
      `Collecting voting machine data in blocks ${fromBlock} - ${toBlock}`
    );

  networkCache = await tryCacheUpdates(
    [
      updateVotingMachines(
        networkCache,
        networkContractsConfig,
        networkWeb3Contracts.multicall,
        fromBlock,
        toBlock,
        web3
      ),
    ],
    networkCache
  );

  if (notificationStore)
    notificationStore.setGlobalLoading(
      true,
      `Updating scheme data in blocks ${fromBlock} - ${toBlock}`
    );

  networkCache = await tryCacheUpdates(
    [
      updateSchemes(
        networkCache,
        networkContractsConfig,
        fromBlock,
        toBlock,
        web3
      ),
    ],
    networkCache
  );

  if (notificationStore)
    notificationStore.setGlobalLoading(
      true,
      `Collecting proposals in blocks ${fromBlock} - ${toBlock}`
    );

  networkCache = await tryCacheUpdates(
    [
      updatePermissionRegistry(
        networkCache,
        networkContractsConfig,
        fromBlock,
        toBlock,
        web3
      ),
      updateProposals(
        networkCache,
        networkContractsConfig,
        fromBlock,
        toBlock,
        web3
      ),
    ],
    networkCache
  );

  if (notificationStore)
    notificationStore.setGlobalLoading(
      true,
      `Collecting VestingFactory VestingCreated events in blocks ${fromBlock} - ${toBlock}`
    );

  networkCache = await tryCacheUpdates(
    [
      updateVestingFactoryCreatedContractsInfo(
        networkCache,
        networkWeb3Contracts.vestingFactory,
        fromBlock,
        toBlock,
        web3
      ),
    ],
    networkCache
  );

  networkCache.l1BlockNumber = Number(toBlock);
  networkCache.l2BlockNumber = 0;

  console.debug('Total Proposals', Object.keys(networkCache.proposals).length);

  return networkCache;
};

// Update the DAOinfo field in cache
export const updateDaoInfo = async function (
  networkCache: DaoNetworkCache,
  networkWeb3Contracts: any,
  web3: any
): Promise<DaoNetworkCache> {
  let callsToExecute = [
    [networkWeb3Contracts.reputation, 'totalSupply', []],
    [
      networkWeb3Contracts.multicall,
      'getEthBalance',
      [networkWeb3Contracts.avatar._address],
    ],
  ];
  const callsResponse = await executeMulticall(
    web3,
    networkWeb3Contracts.multicall,
    callsToExecute
  );

  networkCache.daoInfo.address = networkWeb3Contracts.avatar._address;
  networkCache.daoInfo.repEvents = !networkCache.daoInfo.repEvents
    ? []
    : networkCache.daoInfo.repEvents;
  networkCache.daoInfo.totalRep = bnum(callsResponse.decodedReturnData[0]);
  networkCache.daoInfo.ethBalance = bnum(callsResponse.decodedReturnData[1]);
  if (!networkCache.daoInfo.tokenBalances)
    networkCache.daoInfo.tokenBalances = {};
  return networkCache;
};

// Get all Mint and Burn reputation events to calculate rep by time off chain
export const updateReputationEvents = async function (
  networkCache: DaoNetworkCache,
  reputation: any,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  if (!networkCache.daoInfo.repEvents) networkCache.daoInfo.repEvents = [];

  let reputationEvents = sortEvents(
    await getEvents(web3, reputation, fromBlock, toBlock, 'allEvents')
  );

  reputationEvents.map(reputationEvent => {
    switch (reputationEvent.event) {
      case 'Mint':
        networkCache.daoInfo.repEvents.push({
          event: reputationEvent.event,
          signature: reputationEvent.signature,
          address: reputationEvent.address,
          account: reputationEvent.returnValues._to,
          amount: bnum(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          l1BlockNumber: reputationEvent.l1BlockNumber,
          l2BlockNumber: reputationEvent.l2BlockNumber,
          timestamp: reputationEvent.timestamp,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex,
        });
        break;
      case 'Burn':
        networkCache.daoInfo.repEvents.push({
          event: reputationEvent.event,
          signature: reputationEvent.signature,
          address: reputationEvent.address,
          account: reputationEvent.returnValues._from,
          amount: bnum(reputationEvent.returnValues._amount),
          tx: reputationEvent.transactionHash,
          l1BlockNumber: reputationEvent.l1BlockNumber,
          l2BlockNumber: reputationEvent.l2BlockNumber,
          timestamp: reputationEvent.timestamp,
          transactionIndex: reputationEvent.transactionIndex,
          logIndex: reputationEvent.logIndex,
        });
        break;
    }
  });

  return networkCache;
};

// Update all voting machines
export const updateVotingMachines = async function (
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  multicall: any,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const networkWeb3Contracts = await getContracts(networkContractsConfig, web3);

  await Promise.all(
    Object.keys(networkWeb3Contracts.votingMachines).map(
      async votingMachineName => {
        const votingMachine =
          networkWeb3Contracts.votingMachines[votingMachineName].contract;
        if (!networkCache.votingMachines[votingMachine._address])
          networkCache.votingMachines[votingMachine._address] = {
            name: votingMachineName,
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
              networkWeb3Contracts.votingMachines[votingMachine._address].token
                ._address,
            votingParameters: {},
          };

        networkCache = await updateVotingMachine(
          networkCache,
          networkContractsConfig,
          votingMachine,
          multicall,
          fromBlock,
          toBlock,
          web3
        );
      }
    )
  );

  return networkCache;
};
// Update all voting machine information, events, token and voting parameters used.
export const updateVotingMachine = async function (
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  votingMachine: any,
  multicall: any,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  let newVotingMachineEvents = sortEvents(
    await getEvents(web3, votingMachine, fromBlock, toBlock, 'allEvents')
  );
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
      votingMachineEvent.returnValues._organization ===
        networkContractsConfig.avatar ||
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
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
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
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
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
              event.transactionIndex === votingMachineEvent.transactionIndex &&
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
              l1BlockNumber: votingMachineEvent.l1BlockNumber,
              l2BlockNumber: votingMachineEvent.l2BlockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
          break;
        case 'Stake':
          existEvent = votingMachineEventsInCache.stakes.find(
            event =>
              event.tx === votingMachineEvent.transactionHas &&
              event.transactionIndex === votingMachineEvent.transactionIndex &&
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
              l1BlockNumber: votingMachineEvent.l1BlockNumber,
              l2BlockNumber: votingMachineEvent.l2BlockNumber,
              timestamp: votingMachineEvent.timestamp,
              transactionIndex: votingMachineEvent.transactionIndex,
              logIndex: votingMachineEvent.logIndex,
            });
          break;
        case 'Redeem':
          existEvent = votingMachineEventsInCache.stakes.find(
            event =>
              event.tx === votingMachineEvent.transactionHas &&
              event.transactionIndex === votingMachineEvent.transactionIndex &&
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
              l1BlockNumber: votingMachineEvent.l1BlockNumber,
              l2BlockNumber: votingMachineEvent.l2BlockNumber,
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
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
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
            l1BlockNumber: votingMachineEvent.l1BlockNumber,
            l2BlockNumber: votingMachineEvent.l2BlockNumber,
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
};

// Gets all the events form the permission registry and stores the permissions set.
export const updatePermissionRegistry = async function (
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const networkWeb3Contracts = await getContracts(networkContractsConfig, web3);
  if (networkWeb3Contracts.permissionRegistry._address !== ZERO_ADDRESS) {
    let permissionRegistryEvents = sortEvents(
      await getEvents(
        web3,
        networkWeb3Contracts.permissionRegistry,
        fromBlock,
        toBlock,
        'allEvents'
      )
    );

    permissionRegistryEvents.map(permissionRegistryEvent => {
      const eventValues = permissionRegistryEvent.returnValues;

      if (!networkCache.callPermissions[eventValues.asset])
        networkCache.callPermissions[eventValues.asset] = {};

      if (!networkCache.callPermissions[eventValues.asset][eventValues.from])
        networkCache.callPermissions[eventValues.asset][eventValues.from] = {};

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
};

/**
 * @function updateVestingFactoryCreatedContractsInfo
 * @description Get all "VestingCreated" events from VestingFactory contract and store created TokenVesting contract info into cache.
 */

export const updateVestingFactoryCreatedContractsInfo = async function (
  networkCache: DaoNetworkCache,
  vestingFactoryContract: any,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const contractAddress = vestingFactoryContract?._address;
  if (contractAddress && contractAddress !== ZERO_ADDRESS) {
    try {
      const vestingFactoryEvents = sortEvents(
        await getEvents(
          web3,
          vestingFactoryContract,
          fromBlock,
          toBlock,
          'VestingCreated'
        )
      );

      console.debug(
        'Total VestingFactory "VestingCreated" Events: ',
        vestingFactoryEvents.length
      );

      for (let event of vestingFactoryEvents) {
        const transaction = await web3.eth.getTransaction(
          event.transactionHash
        );
        const tokenVestingContract = await new web3.eth.Contract(
          TokenVestingJSON.abi,
          event.returnValues.vestingContractAddress
        );

        const tokenContractInfo = {
          address: event.returnValues.vestingContractAddress,
          beneficiary: await tokenVestingContract.methods.beneficiary().call(),
          cliff: await tokenVestingContract.methods.cliff().call(),
          duration: await tokenVestingContract.methods.duration().call(),
          owner: await tokenVestingContract.methods.owner().call(),
          value: transaction?.value ?? '0',
        };

        networkCache.vestingContracts = [
          ...(networkCache.vestingContracts ?? []),
          tokenContractInfo,
        ];
      }
    } catch (error) {
      console.error('Error in updateVestingFactoryCreatedContractsInfo', error);
    }
  }

  return networkCache;
};

// Update all the schemes information
export const updateSchemes = async function (
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const networkWeb3Contracts = await getContracts(networkContractsConfig, web3);

  // Get all the events from the Controller
  let controllerEvents = sortEvents(
    await getEvents(
      web3,
      networkWeb3Contracts.controller,
      fromBlock,
      toBlock,
      'allEvents'
    )
  );

  // Go over all controller events and add update or remove schemes depending on the event
  for (
    let controllerEventsIndex = 0;
    controllerEventsIndex < controllerEvents.length;
    controllerEventsIndex++
  ) {
    const controllerEvent = controllerEvents[controllerEventsIndex];

    const schemeAddress = controllerEvent.returnValues._scheme;

    // Add or update the scheme information,
    // register scheme is used to add a scheme or update the parametersHash of an existent one
    if (controllerEvent.event === 'RegisterScheme') {
      const schemeTypeData = getSchemeTypeData(
        networkContractsConfig,
        schemeAddress
      );
      const votingMachine =
        networkWeb3Contracts.votingMachines[schemeTypeData.votingMachine]
          .contract;

      console.debug(
        'Register Scheme event for ',
        schemeAddress,
        schemeTypeData.name
      );

      let controllerAddress = networkWeb3Contracts.controller._address;
      let schemeName = schemeTypeData.name;
      let maxSecondsForExecution = bnum(0);
      let maxRepPercentageChange = bnum(0);
      let schemeType = schemeTypeData.type;

      let callsToExecute = [
        [
          networkWeb3Contracts.controller,
          'getSchemePermissions',
          [schemeAddress, networkWeb3Contracts.avatar._address],
        ],
        [
          networkWeb3Contracts.controller,
          'getSchemeParameters',
          [schemeAddress, networkWeb3Contracts.avatar._address],
        ],
      ];

      if (schemeTypeData.type === 'WalletScheme') {
        const walletSchemeContract = await new web3.eth.Contract(
          WalletScheme1_0JSON.abi,
          schemeAddress
        );
        const walletSchemeType = await walletSchemeContract.methods
          .SCHEME_TYPE()
          .call();

        schemeType = walletSchemeType;
        if (schemeType == 'Wallet Scheme v1') schemeType = 'Wallet Scheme v1.0';

        switch (schemeType) {
          case 'Wallet Scheme v1.1':
            const walletSchemeContract1_1 = await new web3.eth.Contract(
              WalletScheme1_1JSON.abi,
              schemeAddress
            );
            callsToExecute.push([
              walletSchemeContract1_1,
              'doAvatarGenericCalls',
              [],
            ]);
            callsToExecute.push([walletSchemeContract1_1, 'schemeName', []]);
            callsToExecute.push([
              walletSchemeContract1_1,
              'maxSecondsForExecution',
              [],
            ]);
            callsToExecute.push([
              walletSchemeContract1_1,
              'maxRepPercentageChange',
              [],
            ]);
            break;
          default:
            callsToExecute.push([
              walletSchemeContract,
              'controllerAddress',
              [],
            ]);
            callsToExecute.push([walletSchemeContract, 'schemeName', []]);
            callsToExecute.push([
              walletSchemeContract,
              'maxSecondsForExecution',
              [],
            ]);
            callsToExecute.push([
              walletSchemeContract,
              'maxRepPercentageChange',
              [],
            ]);
            break;
        }
      }

      const callsResponse1 = await executeMulticall(
        web3,
        networkWeb3Contracts.multicall,
        callsToExecute
      );
      callsToExecute = [];

      const permissions = decodePermission(callsResponse1.decodedReturnData[0]);
      const paramsHash = callsResponse1.decodedReturnData[1];

      if (schemeTypeData.type === 'WalletScheme') {
        switch (schemeType) {
          case 'Wallet Scheme v1.1':
            controllerAddress = callsResponse1.decodedReturnData[2]
              ? networkWeb3Contracts.controller._address
              : ZERO_ADDRESS;
            break;
          default:
            controllerAddress = callsResponse1.decodedReturnData[2];
            break;
        }
        schemeName = callsResponse1.decodedReturnData[3];
        maxSecondsForExecution = callsResponse1.decodedReturnData[4];
        maxRepPercentageChange = callsResponse1.decodedReturnData[5];
      }

      // Register the new voting parameters in the voting machine params
      const votingParameters = await votingMachine.methods
        .parameters(paramsHash)
        .call();
      networkCache.votingMachines[votingMachine._address].votingParameters[
        paramsHash
      ] = {
        queuedVoteRequiredPercentage:
          votingParameters.queuedVoteRequiredPercentage,
        queuedVotePeriodLimit: votingParameters.queuedVotePeriodLimit,
        boostedVotePeriodLimit: votingParameters.boostedVotePeriodLimit,
        preBoostedVotePeriodLimit: votingParameters.preBoostedVotePeriodLimit,
        thresholdConst: votingParameters.thresholdConst,
        limitExponentValue: votingParameters.limitExponentValue,
        quietEndingPeriod: votingParameters.quietEndingPeriod,
        proposingRepReward: votingParameters.proposingRepReward,
        votersReputationLossRatio: votingParameters.votersReputationLossRatio,
        minimumDaoBounty: votingParameters.minimumDaoBounty,
        daoBountyConst: votingParameters.daoBountyConst,
        activationTime: votingParameters.activationTime,
      };

      // If the scheme not exist, register it
      if (!networkCache.schemes[schemeAddress]) {
        networkCache.schemes[schemeAddress] = {
          address: schemeAddress,
          registered: true,
          controllerAddress,
          name: schemeName,
          type: schemeType,
          ethBalance: bnum(0),
          tokenBalances: {},
          votingMachine: schemeTypeData.votingMachine,
          paramsHash: paramsHash,
          permissions,
          boostedVoteRequiredPercentage: 0,
          proposalIds: [],
          boostedProposals: 0,
          maxSecondsForExecution,
          maxRepPercentageChange,
          newProposalEvents: [],
        };
      } else {
        networkCache.schemes[schemeAddress].paramsHash = paramsHash;
        networkCache.schemes[schemeAddress].permissions = permissions;
      }

      // Mark scheme as not registered but save all previous data
    } else if (
      controllerEvent.event === 'UnregisterScheme' &&
      // This condition is added to skip the first scheme added (that is the dao creator account)
      controllerEvent.returnValues._sender !== schemeAddress
    ) {
      const schemeTypeData = getSchemeTypeData(
        networkContractsConfig,
        schemeAddress
      );
      const votingMachine =
        networkWeb3Contracts.votingMachines[schemeTypeData.votingMachine]
          .contract;

      console.debug(
        'Unregister scheme event',
        schemeAddress,
        schemeTypeData.name
      );
      let callsToExecute = [
        [networkWeb3Contracts.multicall, 'getEthBalance', [schemeAddress]],
        [
          votingMachine,
          'orgBoostedProposalsCnt',
          [
            web3.utils.soliditySha3(
              schemeAddress,
              networkWeb3Contracts.avatar._address
            ),
          ],
        ],
      ];

      if (isWalletScheme(networkCache.schemes[schemeAddress])) {
        callsToExecute.push([
          await new web3.eth.Contract(WalletScheme1_0JSON.abi, schemeAddress),
          'maxSecondsForExecution',
          [],
        ]);
      }
      const callsResponse = await executeMulticall(
        web3,
        networkWeb3Contracts.multicall,
        callsToExecute
      );

      const maxSecondsForExecution = isWalletScheme(
        networkCache.schemes[schemeAddress]
      )
        ? callsResponse.decodedReturnData[2]
        : 0;

      // Update the scheme values a last time
      networkCache.schemes[schemeAddress].ethBalance =
        callsResponse.decodedReturnData[0];
      networkCache.schemes[schemeAddress].boostedProposals =
        callsResponse.decodedReturnData[1];
      networkCache.schemes[schemeAddress].maxSecondsForExecution =
        maxSecondsForExecution;
      networkCache.schemes[schemeAddress].registered = false;
    }
  }
  // Update registered schemes
  await Promise.all(
    Object.keys(networkCache.schemes).map(async schemeAddress => {
      if (networkCache.schemes[schemeAddress].registered) {
        const schemeTypeData = getSchemeTypeData(
          networkContractsConfig,
          schemeAddress
        );
        const votingMachine =
          networkWeb3Contracts.votingMachines[schemeTypeData.votingMachine]
            .contract;

        let callsToExecute = [
          [networkWeb3Contracts.multicall, 'getEthBalance', [schemeAddress]],
          [
            votingMachine,
            'orgBoostedProposalsCnt',
            [
              web3.utils.soliditySha3(
                schemeAddress,
                networkWeb3Contracts.avatar._address
              ),
            ],
          ],
        ];

        if (isWalletScheme(networkCache.schemes[schemeAddress])) {
          callsToExecute.push([
            await new web3.eth.Contract(WalletScheme1_0JSON.abi, schemeAddress),
            'maxSecondsForExecution',
            [],
          ]);
          callsToExecute.push([
            votingMachine,
            'boostedVoteRequiredPercentage',
            [
              web3.utils.soliditySha3(
                schemeAddress,
                networkWeb3Contracts.avatar._address
              ),
              networkCache.schemes[schemeAddress].paramsHash,
            ],
          ]);
        }
        const callsResponse = await executeMulticall(
          web3,
          networkWeb3Contracts.multicall,
          callsToExecute
        );

        const maxSecondsForExecution = isWalletScheme(
          networkCache.schemes[schemeAddress]
        )
          ? callsResponse.decodedReturnData[2]
          : 0;

        const boostedVoteRequiredPercentage = isWalletScheme(
          networkCache.schemes[schemeAddress]
        )
          ? web3.eth.abi.decodeParameters(
              ['uint256'],
              callsResponse.returnData[3]
            )['0']
          : 0;

        networkCache.schemes[schemeAddress].ethBalance =
          callsResponse.decodedReturnData[0];
        networkCache.schemes[schemeAddress].boostedProposals =
          callsResponse.decodedReturnData[1];
        networkCache.schemes[schemeAddress].maxSecondsForExecution =
          maxSecondsForExecution;
        networkCache.schemes[schemeAddress].boostedVoteRequiredPercentage =
          boostedVoteRequiredPercentage;
      }
    })
  );

  return networkCache;
};

// Update all the proposals information
export const updateProposals = async function (
  networkCache: DaoNetworkCache,
  networkContractsConfig: NetworkContracts,
  fromBlock: number,
  toBlock: number,
  web3: any
): Promise<DaoNetworkCache> {
  const networkWeb3Contracts = await getContracts(networkContractsConfig, web3);
  const avatarAddress = networkWeb3Contracts.avatar._address;
  const avatarAddressEncoded = web3.eth.abi.encodeParameter(
    'address',
    avatarAddress
  );

  // Get new proposals
  await Promise.all(
    Object.keys(networkCache.schemes).map(async schemeAddress => {
      const schemeTypeData = getSchemeTypeData(
        networkContractsConfig,
        schemeAddress
      );
      const votingMachine =
        networkWeb3Contracts.votingMachines[schemeTypeData.votingMachine]
          .contract;

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

      console.debug(
        'Getting proposals of',
        schemeTypeData.name,
        schemeEvents.length
      );

      let schemeEventsBatchs = [];
      let schemeEventsBatchsIndex = 0;
      for (var i = 0; i < schemeEvents.length; i += 50)
        schemeEventsBatchs.push(schemeEvents.slice(i, i + 50));

      while (schemeEventsBatchsIndex < schemeEventsBatchs.length) {
        try {
          console.debug(
            'Getting proposals in event batch index',
            schemeEventsBatchsIndex,
            'in',
            schemeTypeData.name
          );
          await Promise.all(
            schemeEventsBatchs[schemeEventsBatchsIndex].map(
              async schemeEvent => {
                const proposalId =
                  schemeEvent.topics[1] === avatarAddressEncoded
                    ? web3.eth.abi.decodeParameter(
                        'bytes32',
                        schemeEvent.topics[2]
                      )
                    : web3.eth.abi.decodeParameter(
                        'bytes32',
                        schemeEvent.topics[1]
                      );
                // Get all the proposal information from the scheme and voting machine
                let callsToExecute = [
                  [votingMachine, 'proposals', [proposalId]],
                  [votingMachine, 'voteStatus', [proposalId, 1]],
                  [votingMachine, 'voteStatus', [proposalId, 2]],
                  [votingMachine, 'proposalStatus', [proposalId]],
                  [votingMachine, 'getProposalTimes', [proposalId]],
                ];

                if (schemeTypeData.type === 'WalletScheme') {
                  callsToExecute.push([
                    await new web3.eth.Contract(
                      WalletScheme1_0JSON.abi,
                      schemeAddress
                    ),
                    'getOrganizationProposal',
                    [proposalId],
                  ]);
                } else if (schemeTypeData.type === 'ContributionReward') {
                  callsToExecute.push([
                    await new web3.eth.Contract(
                      ContributionRewardJSON.abi,
                      schemeAddress
                    ),
                    'getRedeemedPeriods',
                    [proposalId, networkWeb3Contracts.avatar._address, 0],
                  ]);
                  callsToExecute.push([
                    await new web3.eth.Contract(
                      ContributionRewardJSON.abi,
                      schemeAddress
                    ),
                    'getRedeemedPeriods',
                    [proposalId, networkWeb3Contracts.avatar._address, 1],
                  ]);
                  callsToExecute.push([
                    await new web3.eth.Contract(
                      ContributionRewardJSON.abi,
                      schemeAddress
                    ),
                    'getRedeemedPeriods',
                    [proposalId, networkWeb3Contracts.avatar._address, 2],
                  ]);
                  callsToExecute.push([
                    await new web3.eth.Contract(
                      ContributionRewardJSON.abi,
                      schemeAddress
                    ),
                    'getRedeemedPeriods',
                    [proposalId, networkWeb3Contracts.avatar._address, 3],
                  ]);
                }

                const callsResponse = await executeMulticall(
                  web3,
                  networkWeb3Contracts.multicall,
                  callsToExecute
                );

                const votingMachineProposalInfo = web3.eth.abi.decodeParameters(
                  [
                    { type: 'bytes32', name: 'organizationId' },
                    { type: 'address', name: 'callbacks' },
                    { type: 'uint256', name: 'state' },
                    { type: 'uint256', name: 'winningVote' },
                    { type: 'address', name: 'proposer' },
                    { type: 'uint256', name: 'currentBoostedVotePeriodLimit' },
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
                  callsResponse.returnData[0]
                );
                const positiveVotes = callsResponse.returnData[1];
                const negativeVotes = callsResponse.returnData[2];

                const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
                  ['uint256', 'uint256', 'uint256', 'uint256'],
                  callsResponse.returnData[3]
                );
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

                if (schemeTypeData.type === 'WalletScheme') {
                  schemeProposalInfo = web3.eth.abi.decodeParameters(
                    [
                      { type: 'address[]', name: 'to' },
                      { type: 'bytes[]', name: 'callData' },
                      { type: 'uint256[]', name: 'value' },
                      { type: 'uint256', name: 'state' },
                      { type: 'string', name: 'title' },
                      { type: 'string', name: 'descriptionHash' },
                      { type: 'uint256', name: 'submittedTime' },
                    ],
                    callsResponse.returnData[5]
                  );
                } else {
                  if (schemeTypeData.type === 'GenericMulticall') {
                    const executionEvent = await web3.eth.getPastLogs({
                      fromBlock: schemeEvent.l1BlockNumber,
                      address: schemeAddress,
                      topics: [
                        '0x253ad9614c337848bbe7dc3b18b439d139ef5787282b5a517ba7296513d1f533',
                        avatarAddressEncoded,
                        proposalId,
                      ],
                    });
                    if (executionEvent.length > 0)
                      schemeProposalInfo.state =
                        WalletSchemeProposalState.ExecutionSucceded;
                    else
                      schemeProposalInfo.state =
                        WalletSchemeProposalState.Submitted;
                  } else if (schemeTypeData.type === 'ContributionReward') {
                    if (
                      callsResponse.decodedReturnData[5] > 0 ||
                      callsResponse.decodedReturnData[6] > 0 ||
                      callsResponse.decodedReturnData[7] > 0 ||
                      callsResponse.decodedReturnData[8] > 0
                    ) {
                      schemeProposalInfo.state =
                        WalletSchemeProposalState.ExecutionSucceded;
                    } else if (
                      votingMachineProposalInfo.state === '1' ||
                      votingMachineProposalInfo.state === '2'
                    ) {
                      schemeProposalInfo.state =
                        WalletSchemeProposalState.Rejected;
                    } else {
                      schemeProposalInfo.state =
                        WalletSchemeProposalState.Submitted;
                    }
                  }

                  const transactionReceipt =
                    await web3.eth.getTransactionReceipt(
                      schemeEvent.transactionHash
                    );
                  try {
                    schemeTypeData.newProposalTopics.map(
                      (newProposalTopic, i) => {
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
                      }
                    );
                  } catch (error) {
                    console.error(
                      'Error on adding content hash from tx',
                      schemeEvent.transactionHash
                    );
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
                    schemeProposalInfo.to = [
                      networkWeb3Contracts.controller._address,
                    ];
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
                      schemeProposalInfo.to.push(
                        networkWeb3Contracts.controller._address
                      );
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
                }

                networkCache.proposals[proposalId] = {
                  id: proposalId,
                  scheme: schemeAddress,
                  to: schemeProposalInfo.to,
                  title: schemeProposalInfo.title,
                  callData: schemeProposalInfo.callData,
                  values: schemeProposalInfo.value.map(value => bnum(value)),
                  stateInScheme: Number(schemeProposalInfo.state),
                  stateInVotingMachine: Number(votingMachineProposalInfo.state),
                  descriptionHash: schemeProposalInfo.descriptionHash,
                  creationEvent: {
                    event: schemeEvent.event,
                    signature: schemeEvent.signature,
                    address: schemeEvent.address,
                    tx: schemeEvent.transactionHash,
                    l1BlockNumber: schemeEvent.l1BlockNumber,
                    l2BlockNumber: schemeEvent.l2BlockNumber,
                    timestamp: schemeEvent.timestamp,
                    transactionIndex: schemeEvent.transactionIndex,
                    logIndex: schemeEvent.logIndex,
                  },
                  winningVote: votingMachineProposalInfo.winningVote,
                  proposer: decodedProposer
                    ? decodedProposer
                    : votingMachineProposalInfo.proposer,
                  currentBoostedVotePeriodLimit:
                    votingMachineProposalInfo.currentBoostedVotePeriodLimit,
                  paramsHash: votingMachineProposalInfo.paramsHash,
                  daoBountyRemain: bnum(
                    votingMachineProposalInfo.daoBountyRemain
                  ),
                  daoBounty: bnum(votingMachineProposalInfo.daoBounty),
                  totalStakes: bnum(votingMachineProposalInfo.totalStakes),
                  confidenceThreshold:
                    votingMachineProposalInfo.confidenceThreshold,
                  secondsFromTimeOutTillExecuteBoosted:
                    votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted,
                  submittedTime: bnum(proposalTimes[0]),
                  boostedPhaseTime: bnum(proposalTimes[1]),
                  preBoostedPhaseTime: bnum(proposalTimes[2]),
                  daoRedeemItsWinnings:
                    votingMachineProposalInfo.daoRedeemItsWinnings,
                  shouldBoost: false,
                  positiveVotes: bnum(positiveVotes),
                  negativeVotes: bnum(negativeVotes),
                  preBoostedPositiveVotes: bnum(proposalStatusWithVotes[0]),
                  preBoostedNegativeVotes: bnum(proposalStatusWithVotes[1]),
                  positiveStakes: bnum(proposalStatusWithVotes[2]),
                  negativeStakes: bnum(proposalStatusWithVotes[3]),
                };

                networkCache.schemes[schemeAddress].proposalIds.push(
                  proposalId
                );
                networkCache.schemes[schemeAddress].newProposalEvents.push({
                  proposalId: proposalId,
                  event: schemeEvent.event,
                  signature: schemeEvent.signature,
                  address: schemeEvent.address,
                  tx: schemeEvent.transactionHash,
                  l1BlockNumber: schemeEvent.l1BlockNumber,
                  l2BlockNumber: schemeEvent.l2BlockNumber,
                  timestamp: schemeEvent.timestamp,
                  transactionIndex: schemeEvent.transactionIndex,
                  logIndex: schemeEvent.logIndex,
                });

                if (schemeProposalInfo.descriptionHash.length > 1) {
                  networkCache.ipfsHashes.push({
                    hash: descriptionHashToIPFSHash(
                      schemeProposalInfo.descriptionHash
                    ),
                    type: 'proposal',
                    name: proposalId,
                  });
                }
              }
            )
          );

          schemeEventsBatchsIndex++;
        } catch (error) {
          console.error('Error:', (error as Error).message);
          console.debug(
            'Trying again getting proposal info of schemeEventsBatchs index',
            schemeEventsBatchsIndex
          );
        }
      }
    })
  );

  // Update existent active proposals
  await Promise.all(
    Object.keys(networkCache.proposals).map(async proposalId => {
      if (
        networkCache.proposals[proposalId].stateInVotingMachine >
          VotingMachineProposalState.Executed ||
        networkCache.proposals[proposalId].stateInScheme ===
          WalletSchemeProposalState.Submitted
      ) {
        let retry = true;
        while (retry) {
          try {
            const schemeAddress = networkCache.proposals[proposalId].scheme;
            const schemeTypeData = getSchemeTypeData(
              networkContractsConfig,
              schemeAddress
            );
            const votingMachine =
              networkWeb3Contracts.votingMachines[schemeTypeData.votingMachine]
                .contract;

            // Get all the proposal information from the scheme and voting machine
            let callsToExecute = [
              [votingMachine, 'proposals', [proposalId]],
              [votingMachine, 'voteStatus', [proposalId, 1]],
              [votingMachine, 'voteStatus', [proposalId, 2]],
              [votingMachine, 'proposalStatus', [proposalId]],
              [votingMachine, 'getProposalTimes', [proposalId]],
              [votingMachine, 'shouldBoost', [proposalId]],
            ];

            if (schemeTypeData.type === 'WalletScheme') {
              callsToExecute.push([
                await new web3.eth.Contract(
                  WalletScheme1_0JSON.abi,
                  schemeAddress
                ),
                'getOrganizationProposal',
                [proposalId],
              ]);
            } else if (
              schemeTypeData.type === 'ContributionReward' &&
              networkCache.proposals[proposalId].stateInVotingMachine ===
                VotingMachineProposalState.Executed &&
              networkCache.proposals[proposalId].stateInScheme ===
                WalletSchemeProposalState.Submitted
            ) {
              callsToExecute.push([
                await new web3.eth.Contract(
                  ContributionRewardJSON.abi,
                  schemeAddress
                ),
                'getRedeemedPeriods',
                [proposalId, networkWeb3Contracts.avatar._address, 0],
              ]);
              callsToExecute.push([
                await new web3.eth.Contract(
                  ContributionRewardJSON.abi,
                  schemeAddress
                ),
                'getRedeemedPeriods',
                [proposalId, networkWeb3Contracts.avatar._address, 1],
              ]);
              callsToExecute.push([
                await new web3.eth.Contract(
                  ContributionRewardJSON.abi,
                  schemeAddress
                ),
                'getRedeemedPeriods',
                [proposalId, networkWeb3Contracts.avatar._address, 2],
              ]);
              callsToExecute.push([
                await new web3.eth.Contract(
                  ContributionRewardJSON.abi,
                  schemeAddress
                ),
                'getRedeemedPeriods',
                [proposalId, networkWeb3Contracts.avatar._address, 3],
              ]);
            }

            const callsResponse = await executeMulticall(
              web3,
              networkWeb3Contracts.multicall,
              callsToExecute
            );

            const votingMachineProposalInfo = web3.eth.abi.decodeParameters(
              [
                { type: 'bytes32', name: 'organizationId' },
                { type: 'address', name: 'callbacks' },
                { type: 'uint256', name: 'state' },
                { type: 'uint256', name: 'winningVote' },
                { type: 'address', name: 'proposer' },
                { type: 'uint256', name: 'currentBoostedVotePeriodLimit' },
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
              callsResponse.returnData[0]
            );
            const positiveVotes = callsResponse.returnData[1];
            const negativeVotes = callsResponse.returnData[2];

            const proposalStatusWithVotes = web3.eth.abi.decodeParameters(
              ['uint256', 'uint256', 'uint256', 'uint256'],
              callsResponse.returnData[3]
            );
            const proposalTimes = callsResponse.decodedReturnData[4];
            const proposalShouldBoost = callsResponse.decodedReturnData[5];

            if (schemeTypeData.type === 'WalletScheme') {
              networkCache.proposals[proposalId].stateInScheme = Number(
                web3.eth.abi.decodeParameters(
                  [
                    { type: 'address[]', name: 'to' },
                    { type: 'bytes[]', name: 'callData' },
                    { type: 'uint256[]', name: 'value' },
                    { type: 'uint256', name: 'state' },
                    { type: 'string', name: 'title' },
                    { type: 'string', name: 'descriptionHash' },
                    { type: 'uint256', name: 'submittedTime' },
                  ],
                  callsResponse.returnData[6]
                ).state
              );
            } else if (
              schemeTypeData.type === 'ContributionReward' &&
              networkCache.proposals[proposalId].stateInVotingMachine ===
                VotingMachineProposalState.Executed &&
              networkCache.proposals[proposalId].stateInScheme ===
                WalletSchemeProposalState.Submitted
            ) {
              if (schemeTypeData.type === 'ContributionReward') {
                if (
                  callsResponse.decodedReturnData[6] > 0 ||
                  callsResponse.decodedReturnData[7] > 0 ||
                  callsResponse.decodedReturnData[8] > 0 ||
                  callsResponse.decodedReturnData[9] > 0
                ) {
                  networkCache.proposals[proposalId].stateInScheme =
                    WalletSchemeProposalState.ExecutionSucceded;
                } else if (
                  votingMachineProposalInfo.state === '1' ||
                  votingMachineProposalInfo.state === '2'
                ) {
                  networkCache.proposals[proposalId].stateInScheme =
                    WalletSchemeProposalState.Rejected;
                }
              }
            } else if (schemeTypeData.type === 'GenericMulticall') {
              const executionEvent = await web3.eth.getPastLogs({
                fromBlock:
                  networkCache.proposals[proposalId].creationEvent
                    .l1BlockNumber,
                address: schemeAddress,
                topics: [
                  '0x6bc0cb9e9967b59a69ace442598e1df4368d38661bd5c0800fbcbc9fe855fbbe',
                  avatarAddressEncoded,
                  proposalId,
                ],
              });
              if (executionEvent.length > 0)
                networkCache.proposals[proposalId].stateInScheme =
                  WalletSchemeProposalState.ExecutionSucceded;
              else
                networkCache.proposals[proposalId].stateInScheme =
                  WalletSchemeProposalState.Submitted;
            } else if (
              networkCache.proposals[proposalId].stateInVotingMachine ===
              VotingMachineProposalState.Executed
            ) {
              networkCache.proposals[proposalId].stateInScheme =
                WalletSchemeProposalState.ExecutionSucceded;
            }

            networkCache.proposals[proposalId].stateInVotingMachine = Number(
              votingMachineProposalInfo.state
            );
            networkCache.proposals[proposalId].winningVote =
              votingMachineProposalInfo.winningVote;
            networkCache.proposals[proposalId].currentBoostedVotePeriodLimit =
              votingMachineProposalInfo.currentBoostedVotePeriodLimit;
            networkCache.proposals[proposalId].daoBountyRemain = bnum(
              votingMachineProposalInfo.daoBountyRemain
            );
            networkCache.proposals[proposalId].daoBounty = bnum(
              votingMachineProposalInfo.daoBounty
            );
            networkCache.proposals[proposalId].totalStakes = bnum(
              votingMachineProposalInfo.totalStakes
            );
            networkCache.proposals[proposalId].confidenceThreshold =
              votingMachineProposalInfo.confidenceThreshold;
            networkCache.proposals[
              proposalId
            ].secondsFromTimeOutTillExecuteBoosted =
              votingMachineProposalInfo.secondsFromTimeOutTillExecuteBoosted;
            networkCache.proposals[proposalId].boostedPhaseTime = bnum(
              proposalTimes[1]
            );
            networkCache.proposals[proposalId].preBoostedPhaseTime = bnum(
              proposalTimes[2]
            );
            networkCache.proposals[proposalId].daoRedeemItsWinnings =
              votingMachineProposalInfo.daoRedeemItsWinnings;
            networkCache.proposals[proposalId].shouldBoost =
              proposalShouldBoost;
            networkCache.proposals[proposalId].positiveVotes =
              bnum(positiveVotes);
            networkCache.proposals[proposalId].negativeVotes =
              bnum(negativeVotes);
            networkCache.proposals[proposalId].preBoostedPositiveVotes = bnum(
              proposalStatusWithVotes[0]
            );
            networkCache.proposals[proposalId].preBoostedNegativeVotes = bnum(
              proposalStatusWithVotes[1]
            );
            networkCache.proposals[proposalId].positiveStakes = bnum(
              proposalStatusWithVotes[2]
            );
            networkCache.proposals[proposalId].negativeStakes = bnum(
              proposalStatusWithVotes[3]
            );
          } finally {
            retry = false;
          }
        }
        retry = true;
      }
    })
  );

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
  networkCache.ipfsHashes.sort((a, b) => a.hash.localeCompare(b.hash));

  if (!isNode()) {
    const proposalTitles = await getProposalTitlesFromIPFS(
      networkCache,
      toBlock
    );
    Object.keys(networkCache.proposals).map(proposalId => {
      if (!networkCache.proposals[proposalId].title) {
        networkCache.proposals[proposalId].title =
          proposalTitles[proposalId] || '';
      }
    });
  }

  return networkCache;
};

export async function getProposalTitlesFromIPFS(
  networkCache: DaoNetworkCache,
  toBlock: number
) {
  const proposalTitles = {};
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

      // TODO: Fix this xdai proposal IPFS content
      '0xfb15b6f9e3bf61099d20bb3b39375d4e2a6f7ac3c72179537ce147ed991d61b4',
    ];

    // If the script is running on the client side and it alreaady tried three times, continue.
    if (invalidTitleProposals.indexOf(proposal.id) >= 0 || retryIntent > 3) {
      retryIntent = 0;
      continue;
    }

    if (
      isWalletScheme(networkCache.schemes[proposal.scheme]) &&
      proposal.descriptionHash &&
      proposal.descriptionHash.length > 0 &&
      // Try to get title if cache is running in node script or if proposal was submitted in last 100000 blocks
      proposal.title?.length === 0 &&
      (isNode() ||
        proposal.creationEvent.l1BlockNumber > Number(toBlock) - 100000)
    )
      try {
        // console.debug(`Getting title from proposal ${proposal.id} with ipfsHash ${ipfsHash}`);
        const response = await axios.request({
          url: 'https://ipfs.io/ipfs/' + ipfsHash,
          method: 'GET',
          timeout: isNode() ? 2000 : 1000,
        });
        if (response && response.data && response.data.title) {
          proposalTitles[proposal.id] = response.data.title;
        } else {
          console.error(
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
          console.debug((error as Error).message);
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
