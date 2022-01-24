import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';

import {
  CACHE_METADATA_ENS,
  NETWORK_ASSET_SYMBOL,
  NETWORK_NAMES,
  NETWORK_DISPLAY_NAMES,
} from '../utils';
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE } from '../utils';

const Web3 = require('web3');
const web3 = new Web3();
const arbitrum = require('../configs/arbitrum/config.json');
const arbitrumTestnet = require('../configs/arbitrumTestnet/config.json');
const mainnet = require('../configs/mainnet/config.json');
const xdai = require('../configs/xdai/config.json');
const rinkeby = require('../configs/rinkeby/config.json');
const localhost = require('../configs/localhost/config.json');
const proposalTitles = require('../configs/proposalTitles.json');

const defaultAppConfigs = {
  arbitrum,
  arbitrumTestnet,
  mainnet,
  xdai,
  rinkeby,
  localhost,
};

// Use the same content outside src folder in defaultConfigHashes.json or override
const defaultCacheConfig = require('../configs/default.json');

export default class ConfigStore {
  darkMode: boolean;
  context: RootContext;
  networkConfig: NetworkConfig;

  constructor(context) {
    this.context = context;
    this.darkMode = false;
    makeObservable(this, {
      darkMode: observable,
      loadNetworkConfig: action,
      toggleDarkMode: action,
      reset: action,
    });
  }

  reset() {
    this.networkConfig = defaultAppConfigs[this.getActiveChainName()];
  }

  async loadNetworkConfig() {
    const { ensService, ipfsService } = this.context;

    this.networkConfig = defaultAppConfigs[this.getActiveChainName()];
    const isTestingEnv = !window?.location?.href?.includes('dxvote.eth');

    try {
      const metadataHash = await ensService.resolveContentHash(
        CACHE_METADATA_ENS
      );
      if (!metadataHash)
        throw new Error('Cannot resolve content metadata hash.');

      if (!isTestingEnv)
        console.debug(
          `[ConfigStore] Found metadata content hash from ENS: ${metadataHash}`,
          metadataHash
        );

      const configRefs = isTestingEnv
        ? defaultCacheConfig
        : JSON.parse(await ipfsService.getContentFromIPFS(metadataHash));

      const configContentHash = configRefs[this.getActiveChainName()];
      if (!configContentHash)
        throw new Error('Cannot resolve config metadata hash.');

      console.info(`[ConfigStore] IPFS config hash: ${configContentHash}`);

      const ipfsConfig = await ipfsService.getContentFromIPFS(
        configContentHash
      );
      console.debug('[ConfigStore] IPFS config content:', ipfsConfig);
      console.debug('[ConfigStore] Default config:', this.networkConfig);

      // Override defaultConfig to ipfsConfig
      this.networkConfig = Object.assign(ipfsConfig, this.networkConfig);
    } catch (e) {
      console.error(
        '[ConfigStore] Could not get the config from ENS. Falling back to configs in the build.',
        this.networkConfig
      );
    }

    return this.networkConfig;
  }

  getProposalTitlesInBuild() {
    return proposalTitles;
  }

  getActiveChainName() {
    const { chainId } = this.context.providerStore.getActiveWeb3React();
    return NETWORK_NAMES[chainId];
  }

  getActiveChainDisplayName() {
    const { chainId } = this.context.providerStore.getActiveWeb3React();
    return NETWORK_DISPLAY_NAMES[chainId];
  }

  getLocalConfig() {
    if (localStorage.getItem('dxvote-config'))
      return JSON.parse(localStorage.getItem('dxvote-config'));
    else
      return {
        etherscan: '',
        pinata: '',
        rpcType: '',
        infura: '',
        alchemy: '',
        pinOnStart: false,
      };
  }

  setLocalConfig(config) {
    localStorage.setItem('dxvote-config', JSON.stringify(config));
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

  @action setDarkMode(visible: boolean) {
    this.darkMode = visible;
  }

  getCacheIPFSHash(networkName) {
    return this.networkConfig.cache.ipfsHash;
  }

  getSchemeTypeData(schemeAddress) {
    const networkContracts = this.getNetworkContracts();

    if (networkContracts.daostack) {
      if (
        networkContracts.daostack.schemeRegistrar &&
        networkContracts.daostack.schemeRegistrar.address === schemeAddress
      ) {
        return {
          type: 'SchemeRegistrar',
          name: 'SchemeRegistrar',
          contractToCall:
            networkContracts.daostack.schemeRegistrar.contractToCall,
          votingMachine: networkContracts.votingMachines.gen.address,
          newProposalTopics:
            networkContracts.daostack.schemeRegistrar.newProposalTopics,
          voteParams: networkContracts.daostack.schemeRegistrar.voteParams,
          creationLogEncoding:
            networkContracts.daostack.schemeRegistrar.creationLogEncoding,
        };
      } else if (
        networkContracts.daostack.contributionReward &&
        networkContracts.daostack.contributionReward.address === schemeAddress
      ) {
        return {
          type: 'ContributionReward',
          name: 'ContributionReward',
          contractToCall:
            networkContracts.daostack.contributionReward.contractToCall,
          votingMachine: networkContracts.votingMachines.gen.address,
          newProposalTopics:
            networkContracts.daostack.contributionReward.newProposalTopics,
          voteParams: networkContracts.daostack.contributionReward.voteParams,
          creationLogEncoding:
            networkContracts.daostack.contributionReward.creationLogEncoding,
        };
      } else if (
        networkContracts.daostack.competitionScheme &&
        networkContracts.daostack.competitionScheme.address === schemeAddress
      ) {
        return {
          type: 'CompetitionScheme',
          name: 'CompetitionScheme',
          contractToCall:
            networkContracts.daostack.competitionScheme.contractToCall,
          votingMachine: networkContracts.votingMachines.gen.address,
          newProposalTopics:
            networkContracts.daostack.competitionScheme.newProposalTopics,
          creationLogEncoding:
            networkContracts.daostack.competitionScheme.creationLogEncoding,
        };
      } else if (
        networkContracts.daostack.multicallSchemes &&
        Object.keys(
          networkContracts.daostack.multicallSchemes.addresses
        ).indexOf(schemeAddress) > -1
      ) {
        return {
          type: 'GenericMulticall',
          votingMachine: networkContracts.votingMachines.gen.address,
          contractToCall: ZERO_ADDRESS,
          name: networkContracts.daostack.multicallSchemes.addresses[
            schemeAddress
          ].name,
          newProposalTopics:
            networkContracts.daostack.multicallSchemes.newProposalTopics,
          voteParams:
            networkContracts.daostack.multicallSchemes.addresses[schemeAddress]
              .voteParams,
          creationLogEncoding:
            networkContracts.daostack.multicallSchemes.creationLogEncoding,
        };
      } else if (
        networkContracts.daostack.genericSchemes &&
        Object.keys(networkContracts.daostack.genericSchemes.addresses).indexOf(
          schemeAddress
        ) > -1
      ) {
        return {
          type: 'GenericScheme',
          votingMachine:
            networkContracts.daostack.genericSchemes.addresses[schemeAddress]
              .votingMachine,
          contractToCall:
            networkContracts.daostack.genericSchemes.addresses[schemeAddress]
              .contractToCall,
          name: networkContracts.daostack.genericSchemes.addresses[
            schemeAddress
          ].name,
          newProposalTopics:
            networkContracts.daostack.genericSchemes.newProposalTopics,
          voteParams:
            networkContracts.daostack.genericSchemes.addresses[schemeAddress]
              .voteParams,
          creationLogEncoding:
            networkContracts.daostack.genericSchemes.creationLogEncoding,
        };
      } else if (
        networkContracts.daostack.dxSchemes &&
        Object.keys(networkContracts.daostack.dxSchemes).indexOf(
          schemeAddress
        ) > -1
      ) {
        return {
          type: 'OldDxScheme',
          votingMachine: networkContracts.votingMachines.gen.address,
          contractToCall: ZERO_ADDRESS,
          name: networkContracts.daostack.dxSchemes[schemeAddress],
          newProposalTopics: [],
          creationLogEncoding: [],
        };
      }
    }
    return {
      type: 'WalletScheme',
      votingMachine: networkContracts.votingMachines.dxd.address,
      name: 'WalletScheme',
      newProposalTopics: [
        [
          web3.utils.soliditySha3('ProposalStateChange(bytes32,uint256)'),
          null,
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
      ],
      creationLogEncoding: [],
    };
  }

  getTokenData(tokenAddress) {
    return this.networkConfig.tokens.find(
      tokenInFile => tokenInFile.address === tokenAddress
    );
  }

  getNetworkContracts() {
    return this.networkConfig.contracts;
  }

  getTokensOfNetwork() {
    return this.networkConfig.tokens;
  }

  getTokensToFetchPrice() {
    return this.networkConfig.tokens.filter(
      tokenInFile => tokenInFile.fetchPrice
    );
  }

  getProposalTemplates() {
    return this.networkConfig.proposalTemplates;
  }

  getProposalTypes() {
    return this.networkConfig.proposalTypes;
  }

  getContributorLevels() {
    return this.networkConfig.contributionLevels;
  }

  getRecommendedCalls() {
    const networkName = this.getActiveChainName();
    const networkContracts = this.getNetworkContracts();
    const networkTokens = this.getTokensOfNetwork();

    let recommendedCalls: {
      asset: string;
      from: string;
      to: string;
      toName: string;
      functionName: string;
      params: {
        type: string;
        name: string;
        defaultValue: string;
        decimals?: number;
        isRep?: boolean;
      }[];
      decodeText: string;
    }[] = [
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'mintReputation(uint256,address,address)',
        params: [
          {
            type: 'uint256',
            name: '_amount',
            defaultValue: '',
            decimals: 18,
            isRep: true,
          },
          { type: 'address', name: '_to', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Mint of [PARAM_0] to [PARAM_1]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.schemes?.QuickWalletScheme,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'mintReputation(uint256,address,address)',
        params: [
          {
            type: 'uint256',
            name: '_amount',
            defaultValue: '',
            decimals: 18,
            isRep: true,
          },
          { type: 'address', name: '_to', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Mint of [PARAM_0] to [PARAM_1]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'burnReputation(uint256,address,address)',
        params: [
          {
            type: 'uint256',
            name: '_amount',
            defaultValue: '',
            decimals: 18,
            isRep: true,
          },
          { type: 'address', name: '_from', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Burn of [PARAM_0] to [PARAM_1]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'registerScheme(address,bytes32,bytes4,address)',
        params: [
          { type: 'address', name: '_scheme', defaultValue: '' },
          { type: 'bytes32', name: '_paramsHash', defaultValue: '' },
          { type: 'bytes4', name: '_permissions', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText:
          'Register scheme [PARAM_0] with params hash [PARAM_1] and permissions [PARAM_2]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'unregisterScheme(address,address)',
        params: [
          { type: 'address', name: '_scheme', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Unregister scheme [PARAM_0]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'genericCall(address,bytes,addres,uint256)',
        params: [
          { type: 'address', name: '_contract', defaultValue: '' },
          { type: 'bytes', name: '_data', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
          { type: 'uint256', name: '_value', defaultValue: '' },
        ],
        decodeText:
          'Generic call to [PARAM_0] with data [PARAM_1] and value [PARAM_2] ' +
          NETWORK_ASSET_SYMBOL[networkName],
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'externalTokenTransfer(address,address,uint256,address)',
        params: [
          { type: 'address', name: '_externalToken', defaultValue: '' },
          { type: 'address', name: '_to', defaultValue: '' },
          { type: 'uint256', name: '_value', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText:
          'External token transfer of token [PARAM_0] with value [PARAM_2] to [PARAM_1]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName:
          'externalTokenTransferFrom(address,address,address,uint256,address)',
        params: [
          { type: 'address', name: '_externalToken', defaultValue: '' },
          { type: 'address', name: '_from', defaultValue: '' },
          { type: 'address', name: '_to', defaultValue: '' },
          { type: 'uint256', name: '_value', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText:
          'External token transferFrom of token [PARAM_0] with value [PARAM_3] from [PARAM_1] to [PARAM_2]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'externalTokenApproval(address,address,uint256,address)',
        params: [
          { type: 'address', name: '_externalToken', defaultValue: '' },
          { type: 'address', name: '_spender', defaultValue: '' },
          { type: 'uint256', name: '_value', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText:
          'External token approval of token [PARAM_0] from [PARAM_1] with value [PARAM_3] to [PARAM_2]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'sendEther(uint256,address,address)',
        params: [
          {
            type: 'uint256',
            name: '_amountInWei',
            defaultValue: '',
            decimals: 18,
          },
          { type: 'address', name: '_to', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText:
          'Transfer of [PARAM_0] ' +
          NETWORK_ASSET_SYMBOL[networkName] +
          ' to [PARAM_1] ',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.permissionRegistry,
        toName: 'Permission Registry',
        functionName: 'setTimeDelay(uint256)',
        params: [{ type: 'uint256', name: 'newTimeDelay', defaultValue: '' }],
        decodeText: 'Set time delay to [PARAM_0] seconds',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.permissionRegistry,
        toName: 'Permission Registry',
        functionName:
          'setAdminPermission(address,address,address,bytes4,uint256,bool)',
        params: [
          { type: 'address', name: 'asset', defaultValue: ZERO_ADDRESS },
          { type: 'address', name: 'from', defaultValue: '' },
          { type: 'address', name: 'to', defaultValue: '' },
          {
            type: 'bytes4',
            name: 'functionSignature',
            defaultValue: ANY_FUNC_SIGNATURE,
          },
          { type: 'uint256', name: 'valueAllowed', defaultValue: '0' },
          { type: 'bool', name: 'allowed', defaultValue: 'true' },
        ],
        decodeText:
          'Set [PARAM_5] admin permission in asset [PARAM_0] from [PARAM_1] to [PARAM_2] with function signature [PARAM_3] and value [PARAM_4]',
      },
      {
        asset: ZERO_ADDRESS,
        from: ANY_ADDRESS,
        to: networkContracts.permissionRegistry,
        toName: 'Permission Registry',
        functionName: 'setPermission(address,address,bytes4,uint256,bool)',
        params: [
          { type: 'address', name: 'asset', defaultValue: ZERO_ADDRESS },
          { type: 'address', name: 'to', defaultValue: '' },
          { type: 'bytes4', name: 'functionSignature', defaultValue: '' },
          { type: 'uint256', name: 'valueAllowed', defaultValue: '' },
          { type: 'bool', name: 'allowed', defaultValue: '' },
        ],
        decodeText:
          'Set permission in asset [PARAM_0] for scheme [FROM] to [PARAM_1] with function signature [PARAM_2] and value [PARAM_3]',
      },
      {
        asset: ZERO_ADDRESS,
        from: ANY_ADDRESS,
        to: networkContracts.utils.dxdVestingFactory,
        toName: 'DXD Vesting Factory',
        functionName: 'create(address,uint256,uint256,uint256,uint256)',
        params: [
          { type: 'address', name: 'to', defaultValue: '' },
          { type: 'uint256', name: 'startDate', defaultValue: '' },
          { type: 'uint256', name: 'cliff', defaultValue: '' },
          { type: 'uint256', name: 'duration', defaultValue: '' },
          { type: 'uint256', name: 'amount', defaultValue: '' },
        ],
        decodeText:
          'Create vesting contract of [PARAM_4] DXD for [PARAM_0] starting [PARAM_1] for [PARAM_2] with [PARAM_3] cliff',
      },
    ];

    if (networkContracts.utils.dxdVestingFactory) {
      recommendedCalls.push({
        asset: networkContracts.utils.dxdVestingFactory,
        from: networkContracts.avatar,
        to: networkContracts.utils.dxdVestingFactory,
        toName: 'DXD Vesting Factory',
        functionName: 'create(address, uint256, uint256, uint256, uint256)',
        params: [
          { type: 'address', name: 'beneficiary', defaultValue: '' },
          { type: 'uint256', name: 'start', defaultValue: '' },
          { type: 'uint256', name: 'cliffDuration', defaultValue: '' },
          { type: 'uint256', name: 'duration', defaultValue: '' },
          { type: 'uint256', name: 'value', defaultValue: '' },
        ],
        decodeText:
          'Create new vesting contract with beneficiary [PARAM_0], start date  of [PARAM_1], cliff duration of [PARAMS_2], duration of [PARAM_3] and value of [PARAM_4]',
      });
      if (networkContracts.utils.dxDaoNFT) {
        recommendedCalls.push({
          asset: ZERO_ADDRESS,
          from: networkContracts.avatar,
          to: networkContracts.utils.dxDaoNFT,
          toName: 'DXdao NFT',
          functionName: 'mint(address, string)',
          params: [
            {
              type: 'address',
              name: 'recipient',
              defaultValue: networkContracts.avatar,
            },
            { type: 'string', name: 'tokenURI', defaultValue: '' },
          ],
          decodeText: 'Mint NFT to address [PARAM_0] with token URI [PARAM_1]',
        });
      }
    }

    if (
      this.networkConfig.recommendedCalls &&
      this.networkConfig.recommendedCalls.length > 0
    )
      recommendedCalls = recommendedCalls.concat(
        this.networkConfig.recommendedCalls
      );

    networkTokens.map(networkToken => {
      recommendedCalls.push({
        asset: networkToken.address,
        from: ANY_ADDRESS,
        to: networkToken.address,
        toName: `ERC20 (${networkToken.symbol})`,
        functionName: 'transfer(address,uint256)',
        params: [
          { type: 'address', name: 'to', defaultValue: '' },
          {
            type: 'uint256',
            name: 'value',
            defaultValue: '0',
            decimals: networkToken.decimals,
          },
        ],
        decodeText:
          'Transfer [PARAM_1] ' + networkToken.symbol + ' to [PARAM_0]',
      });

      recommendedCalls.push({
        asset: networkToken.address,
        from: ANY_ADDRESS,
        to: networkToken.address,
        toName: `ERC20 ${networkToken.symbol}`,
        functionName: 'approve(address,uint256)',
        params: [
          { type: 'address', name: 'to', defaultValue: '' },
          {
            type: 'uint256',
            name: 'value',
            defaultValue: '0',
            decimals: networkToken.decimals,
          },
        ],
        decodeText:
          'Approve [PARAM_1] ' + networkToken.symbol + ' to [PARAM_0]',
      });
    });

    return recommendedCalls;
  }
}
