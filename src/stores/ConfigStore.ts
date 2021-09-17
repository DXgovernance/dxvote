import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';

import { NETWORK_ASSET_SYMBOL, NETWORK_NAMES } from '../utils';
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE } from '../utils';

const Web3 = require('web3');
const web3 = new Web3();
const appConfig = require('../config.json');

export default class ConfigStore {
  darkMode: boolean;
  context: RootContext;
  appConfig: AppConfig = appConfig;

  constructor(context) {
    this.context = context;
    this.darkMode = false;
    makeObservable(this, {
      darkMode: observable,
      toggleDarkMode: action,
    });
  }

  getActiveChainName() {
    const activeWeb3 = this.context.providerStore.getActiveWeb3React();
    return activeWeb3 ? NETWORK_NAMES[activeWeb3.chainId] : 'none';
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
    return appConfig[networkName].cache.ipfsHash;
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
          voteParams: networkContracts.daostack.contributionReward.voteParams,
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
    return this.appConfig[this.getActiveChainName()].tokens.find(
      tokenInFile => tokenInFile.address === tokenAddress
    );
  }

  getNetworkContracts() {
    return this.appConfig[this.getActiveChainName()].contracts;
  }

  getTokensOfNetwork() {
    return this.appConfig[this.getActiveChainName()].tokens;
  }

  getTokensToFetchPrice() {
    return this.appConfig[this.getActiveChainName()].tokens.filter(
      tokenInFile => tokenInFile.fetchPrice
    );
  }

  getProposalTemplates() {
    return this.appConfig[this.getActiveChainName()].proposalTemplates;
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
          { type: 'uint256', name: '_amount', defaultValue: '', decimals: 18 },
          { type: 'address', name: '_to', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Mint of [PARAM_0] REP to [PARAM_1]',
      },
      {
        asset: ZERO_ADDRESS,
        from: networkContracts.avatar,
        to: networkContracts.controller,
        toName: 'DXdao Controller',
        functionName: 'burnReputation(uint256,address,address)',
        params: [
          { type: 'uint256', name: '_amount', defaultValue: '', decimals: 18 },
          { type: 'address', name: '_from', defaultValue: '' },
          {
            type: 'address',
            name: '_avatar',
            defaultValue: networkContracts.avatar,
          },
        ],
        decodeText: 'Burn of [PARAM_0] REP to [PARAM_1]',
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
          'Set [PARAM_5] permission in asset [PARAM_0] from [FROM] to [PARAM_2] with function signature [PARAM_3] and value [PARAM_4]',
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
      this.appConfig[networkName].recommendedCalls &&
      this.appConfig[networkName].recommendedCalls.length > 0
    )
      recommendedCalls = recommendedCalls.concat(
        this.appConfig[networkName].recommendedCalls
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
