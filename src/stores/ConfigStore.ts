import { makeObservable, observable, action } from 'mobx';
import RootContext from '../contexts';
import { _ } from 'lodash';
import { NETWORK_NAMES } from '../provider/connectors';

const Web3 = require('web3');
const web3 = new Web3();

const ipfsHashesOfNetworkCaches = {
  "mainnet": "QmZVaa3n4gZqrqMX6233FeD3TQC95QwUWwn6p72KNySxeN",
  "xdai": "QmTqG4fj72npVGmjodNdJ6ZSUMjaD4SZNJDNCFZF1vutwV",
  "rinkeby": "QmbstfTpn2aBsxGQqkA9Y1RWPbTjB829ePWhFQsZwBv3iJ",
  "arbitrumTestnet": "QmW8GarhVMNSNS6PNAvnsRu39UbKXRwEWQtU4BueYsQiwz",
  "localhost": "QmQFGjpUk52fYWNm3nWgELTjqter1dwnAaXggAhggnc26f",
  "arbitrum": "QmccjtNMVNqK7WGi34Lc22WpKk85N27eVm6pBJ1wPchWYW"
};
const ipfsHashOfAppConfig = "QmPk2UACGq4Ti19J6LSWgfGk9NdpiX4Mky74HLn9yuvjWP";

import { NETWORK_ASSET_SYMBOL } from '../provider/connectors';
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE } from '../utils';

export default class ConfigStore {
    darkMode: boolean;
    context: RootContext;
    appConfig: AppConfig;

    constructor(context) {
      this.context = context;
      this.darkMode = false;
      makeObservable(this, {
          darkMode: observable,
          toggleDarkMode: action
        }
      );
    }
    
    getActiveChainName() {
      const activeWeb3 = this.context.providerStore.getActiveWeb3React();
      return activeWeb3 ? NETWORK_NAMES[activeWeb3.chainId] : 'none';
    }
    
    getLocalConfig() {
      if (localStorage.getItem('dxvote-config'))
        return JSON.parse(localStorage.getItem('dxvote-config'));
      else return {
        etherscan: '',
        pinata: '',
        pinOnStart: false
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
    
    @action async loadConfig() {
      const config = await this.context.ipfsService.getContentFromIPFS(ipfsHashOfAppConfig)
      this.appConfig = config;
    }
    
    getCacheIPFSHash(networkName) {
      return ipfsHashesOfNetworkCaches[networkName];
    }
    
    getNetworkConfig() {
      const networkName = this.getActiveChainName();
      let networkConfig;

      if (networkName === 'localhost') {
        networkConfig = {
          fromBlock: 1,
          avatar: process.env.REACT_APP_AVATAR_ADDRESS.replace(/["']/g, ""),
          controller: process.env.REACT_APP_CONTROLLER_ADDRESS.replace(/["']/g, ""),
          reputation: process.env.REACT_APP_REPUTATION_ADDRESS.replace(/["']/g, ""),
          permissionRegistry: process.env.REACT_APP_PERMISSION_REGISTRY_ADDRESS.replace(/["']/g, ""),
          utils: {
            multicall: process.env.REACT_APP_MULTICALL_ADDRESS.replace(/["']/g, ""),
          },
          votingMachines: {
            dxd: {
              address: process.env.REACT_APP_VOTING_MACHINE_ADDRESS.replace(/["']/g, ""),
              token: process.env.REACT_APP_VOTING_MACHINE_TOKEN_ADDRESS.replace(/["']/g, "")
            }
          },
        };
      } else  if (networkName == 'mainnet') {
        networkConfig = this.appConfig.mainnet.contracts;
        const avatarAddressEncoded = web3.eth.abi.encodeParameter('address', networkConfig.avatar);
        
        networkConfig.daostack = {
          
          "contributionRewardRedeemer": "0x406bfD9cDb247432fEEA52edD218F2a4Bd238C9b",
          
          "dxSchemes": {
            "0x2E6FaE82c77e1D6433CCaAaF90281523b99D0D0a": "DxLockMgnForRep",
            "0x4D8DB062dEFa0254d00a44aA1602C30594e47B12": "DxGenAuction4Rep",
            "0x4564BFe303900178578769b2D76B1a13533E5fd5": "DxLockEth4Rep",
            "0x1cb5B2BB4030220ad5417229A7A1E3c373cDD2F6": "DxLockWhitelisted4Rep"
          },
          
          "schemeRegistrar": {
            "address": "0xf050F3C6772Ff35eB174A6900833243fcCD0261F",
            "contractToCall": networkConfig.controller,
            "voteParams": "0x9799ec39e42562c5ac7fbb104f1edcaa495e00b45e0db80cce1c0cdc863d0d0f",
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewSchemeProposal(address,bytes32,address,address,bytes32,bytes4,string)"), avatarAddressEncoded],
              [web3.utils.soliditySha3("RemoveSchemeProposal(address,bytes32,address,address,string)"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
                { type:'address', name: "_scheme "},
                { type:'bytes32', name: "_parametersHash"},
                { type:'bytes4', name: "_permissions"},
                { type:'string', name: "_descriptionHash"}
              ],[
                { type:'address', name: "_scheme "},
                { type:'string', name: "_descriptionHash"}
              ]
            ]
          },
          
          "contributionReward": {
            "address": "0x08cC7BBa91b849156e9c44DEd51896B38400f55B",
            "contractToCall": networkConfig.controller,
            "voteParams": "0x399141801e9e265d79f1f1759dd67932980664ea28c2ba7e0e4dba8719e47118",
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewContributionProposal(address,bytes32,address,string,int256,uint256[5],address,address)"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
              { type:'string', name: "_descriptionHash"},
              { type:'int256', name: "_reputationChange"},
              { type:'uint256[5]', name: "_rewards"},
              { type:'address', name: "_externalToken"},
              { type:'address', name: "_beneficiary"}
            ]]
          },
          
          "genericSchemes": {
            "addresses": {
              "0x199719EE4d5DCF174B80b80afa1FE4a8e5b0E3A0": {
                "name": "DutchXScheme",
                "votingMachine": "0x332B8C9734b4097dE50f302F7D9F273FFdB45B84",
                "voteParams": "0xff6155010292b35fb8daae8b4450cdc41a586bc591e9a76484e88ffba36f94a8",
                "contractToCall": "0xb9812E2fA995EC53B5b6DF34d21f9304762C5497",
              },
              "0x46DF3EA38a680FBc84E744D92b0A8Ec717B2eA7E":{
                "name": "GenericSchemeToENS",
                "votingMachine": "0x332B8C9734b4097dE50f302F7D9F273FFdB45B84",
                "voteParams": "0x29ddbf85a0d14e08084cd9764c66ff2799d05355edf7f546c5af1c847a2d9734",
                "contractToCall": "0x314159265dd8dbb310642f98f50c066173c1259b",
              },
              "0x9A543aeF934c21Da5814785E38f9A7892D3CDE6E": {
                "name": "EnsPublicProviderScheme",
                "votingMachine": "0x332B8C9734b4097dE50f302F7D9F273FFdB45B84",
                "voteParams": "0x29ddbf85a0d14e08084cd9764c66ff2799d05355edf7f546c5af1c847a2d9734",
                "contractToCall": "0x226159d592e2b063810a10ebf6dcbada94ed68b8",
              },
              "0x973ce4e81BdC3bD39f46038f3AaA928B04558b08": {
                "name": "EnsRegistrarScheme",
                "votingMachine": "0x332B8C9734b4097dE50f302F7D9F273FFdB45B84",
                "voteParams": "0x29ddbf85a0d14e08084cd9764c66ff2799d05355edf7f546c5af1c847a2d9734",
                "contractToCall": "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85",
              },
              "0x9CEA0DD05C4344A769B2F4C2f8890EDa8a700d64": {
                "name": "EnsRegistryScheme",
                "votingMachine": "0x332B8C9734b4097dE50f302F7D9F273FFdB45B84",
                "voteParams": "0x0dc1fb4d230debe146613511601e0df83dd5ac323a7add833de82ead5a19db3a",
                "contractToCall": "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
              },
              "0xc072171dA83CCe311e37BC1d168f54E6A6536DF4": {
                "name": "TokenRegistry",
                "votingMachine": "0x1C18bAd5a3ee4e96611275B13a8ed062B4a13055",
                "voteParams": "0x8452e57c89dc78ec1b1ffc28786655279f9af4ac589dd5988c962e8cf6b4529b",
                "contractToCall": "0x93db90445b76329e9ed96ecd74e76d8fbf2590d8",
              },
              "0xB3ec6089556CcA49549Be01fF446cF40fA81c84D": {
                "name": "EnsPublicResolverScheme",
                "votingMachine": "0x1C18bAd5a3ee4e96611275B13a8ed062B4a13055",
                "voteParams": "0xa81f982cb1c27eb142e5f602e7eb50d125dd6a7e52dac1af5f9decb88278f2fa",
                "contractToCall": "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41",
              },
            },
            "newProposalTopics": [
              [ web3.utils.soliditySha3("NewCallProposal(address,bytes32,bytes,uint256,string)"), avatarAddressEncoded ]
            ],
            "creationLogEncoding": [[
              { type:'bytes', name: "_data"},
              { type:'uint256', name: "_value"},
              { type:'string', name: "_descriptionHash"}
            ]]
          },
          
          "multicallSchemes": {
            "addresses": {
              "0xef9dC3c39CA40A2a3000ACc5ca0467CE1C250808": {
                "name": "Multicall_1",
                "voteParams": "0xe5e87e294b422b2aa711bd25a7e8ac59a06bbf723786560c53c50edce980f2fd"
              },
              "0x34C42c3ee81A03FD9ea773987b4a6eF62f3fc151": {
                "name": "Multicall_2",
                "voteParams": "0x8a8f5413c9b49a4ed4df33213f474a0ae29328a81b3c40c881e8a3fab0d12b44"
              },
              "0x0f4775722a72FA85230c63598e661eC52563Fb4E": {
                "name": "Multicall_3",
                "voteParams": "0xe5e87e294b422b2aa711bd25a7e8ac59a06bbf723786560c53c50edce980f2fd"
              }
            },
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewMultiCallProposal(address,bytes32,bytes[],uint256[],string,address[])"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
              { type:'bytes[]', name: "_callsData"},
              { type:'uint256[]', name: "_values"},
              { type:'string', name: "_descriptionHash"},
              { type:'address[]', name: "_contractsToCall"}
            ]]
          }
        };
        
      } else if (networkName == 'xdai') {
        networkConfig = this.appConfig.xdai.contracts;
        const avatarAddressEncoded = web3.eth.abi.encodeParameter('address', networkConfig.avatar);
        
        networkConfig.daostack = {
          
          "contributionRewardRedeemer": "0xd2cc17817c0d4cfc6819510b2e5288512122d71c",
          
          "schemeRegistrar": {
            "address": "0x22Ac81BE75cF76281D88A0F3A8Ae59b9abbE9da1",
            "contractToCall": networkConfig.controller,
            "voteParams": "0x1e3e01f4ce01291e53f32570ab772ef6e7301d7223b00c162494e26cc16830df",
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewSchemeProposal(address,bytes32,address,address,bytes32,bytes4,string)"), avatarAddressEncoded],
              [web3.utils.soliditySha3("RemoveSchemeProposal(address,bytes32,address,address,string)"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
                { type:'address', name: "_scheme "},
                { type:'bytes32', name: "_parametersHash"},
                { type:'bytes4', name: "_permissions"},
                { type:'string', name: "_descriptionHash"}
              ],[
                { type:'address', name: "_scheme "},
                { type:'string', name: "_descriptionHash"}
              ]
            ]
          },
          
          "contributionReward": {
            "address": "0x016Bf002D361bf5563c76230D19B4DaB4d66Bda4",
            "contractToCall": networkConfig.controller,
            "voteParams": "0x1e3e01f4ce01291e53f32570ab772ef6e7301d7223b00c162494e26cc16830df",
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewContributionProposal(address,bytes32,address,string,int256,uint256[5],address,address)"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
              { type:'string', name: "_descriptionHash"},
              { type:'int256', name: "_reputationChange"},
              { type:'uint256[5]', name: "_rewards"},
              { type:'address', name: "_externalToken"},
              { type:'address', name: "_beneficiary"}
            ]]
          },
          
          "competitionScheme": {
            "address": "0x73753baC5B0fBECfd741436b64163f670E0aCB30",
            "contractToCall": ZERO_ADDRESS,
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewContributionProposal(address,bytes32,address,string,int256,uint256[3],address,address,address)"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
              { type:'string', name: "_descriptionHash"},
              { type:'int256', name: "_reputationChange"},
              { type:'uint256[5]', name: "_rewards"},
              { type:'address', name: "_externalToken"},
              { type:'address', name: "_beneficiary"}
            ]]
          },
          
          "multicallSchemes": {
            "addresses": {
              "0xaFE59DF878E23623A7a91d16001a66A4DD87e0c0": {
                "name": "Multicall_1",
                "voteParams": "0x1e3e01f4ce01291e53f32570ab772ef6e7301d7223b00c162494e26cc16830df",
                "votingMachine": "0xDA309aDF1c84242Bb446F7CDBa96B570E901D4CF"
              }
            },
            "newProposalTopics": [
              [web3.utils.soliditySha3("NewMultiCallProposal(address,bytes32,bytes[],uint256[],string,address[])"), avatarAddressEncoded]
            ],
            "creationLogEncoding": [[
              { type:'bytes[]', name: "_callsData"},
              { type:'uint256[]', name: "_values"},
              { type:'string', name: "_descriptionHash"},
              { type:'address[]', name: "_contractsToCall"}
            ]]
          },
          
          "dxSchemes": {
            "0x2b644360a24366B1ebdBf4f69563eAfA4772bCA0": "InvalidScheme",
            "0x50d895Df2ea26b4C3aBbFa22906197458F56bAe9": "DaoDeployer",
            "0x63F411E7cA67CB296FE2c7B875E072E82A609436": "DaoDeployer2"
          },
          
        };
        
      } else {
        networkConfig = this.appConfig[networkName].contracts;
      };
      
      return networkConfig;
    }

    getSchemeTypeData(schemeAddress) {
      const networkConfig = this.getNetworkConfig();
      
      if (networkConfig.daostack) {
        if (networkConfig.daostack.schemeRegistrar && networkConfig.daostack.schemeRegistrar.address == schemeAddress) {
          return {
            type: "SchemeRegistrar",
            name: "SchemeRegistrar",
            contractToCall: networkConfig.daostack.schemeRegistrar.contractToCall,
            votingMachine: networkConfig.votingMachines.gen.address,
            newProposalTopics: networkConfig.daostack.schemeRegistrar.newProposalTopics,
            voteParams: networkConfig.daostack.contributionReward.voteParams,
            creationLogEncoding: networkConfig.daostack.schemeRegistrar.creationLogEncoding
          };
        } else if (networkConfig.daostack.contributionReward && networkConfig.daostack.contributionReward.address == schemeAddress) {
          return {
            type: "ContributionReward",
            name: "ContributionReward",
            contractToCall: networkConfig.daostack.contributionReward.contractToCall,
            votingMachine: networkConfig.votingMachines.gen.address,
            newProposalTopics: networkConfig.daostack.contributionReward.newProposalTopics,
            voteParams: networkConfig.daostack.contributionReward.voteParams,
            creationLogEncoding: networkConfig.daostack.contributionReward.creationLogEncoding
          };
        } else if (networkConfig.daostack.competitionScheme && networkConfig.daostack.competitionScheme.address == schemeAddress) {
          return {
            type: "CompetitionScheme",
            name: "CompetitionScheme",
            contractToCall: networkConfig.daostack.competitionScheme.contractToCall,
            votingMachine: networkConfig.votingMachines.gen.address,
            newProposalTopics: networkConfig.daostack.competitionScheme.newProposalTopics,
            creationLogEncoding: networkConfig.daostack.competitionScheme.creationLogEncoding
          };
        } else if (networkConfig.daostack.multicallSchemes && Object.keys(networkConfig.daostack.multicallSchemes.addresses).indexOf(schemeAddress) > -1) {
          return {
            type: "GenericMulticall",
            votingMachine: networkConfig.votingMachines.gen.address,
            contractToCall: ZERO_ADDRESS,
            name: networkConfig.daostack.multicallSchemes.addresses[schemeAddress].name,
            newProposalTopics: networkConfig.daostack.multicallSchemes.newProposalTopics,
            voteParams: networkConfig.daostack.multicallSchemes.addresses[schemeAddress].voteParams,
            creationLogEncoding: networkConfig.daostack.multicallSchemes.creationLogEncoding
          };
        } else if (networkConfig.daostack.genericSchemes && Object.keys(networkConfig.daostack.genericSchemes.addresses).indexOf(schemeAddress) > -1) {
          return {
            type: "GenericScheme",
            votingMachine: networkConfig.daostack.genericSchemes.addresses[schemeAddress].votingMachine,
            contractToCall: networkConfig.daostack.genericSchemes.addresses[schemeAddress].contractToCall,
            name: networkConfig.daostack.genericSchemes.addresses[schemeAddress].name,
            newProposalTopics: networkConfig.daostack.genericSchemes.newProposalTopics,
            voteParams: networkConfig.daostack.genericSchemes.addresses[schemeAddress].voteParams,
            creationLogEncoding: networkConfig.daostack.genericSchemes.creationLogEncoding
          };
        } else if (networkConfig.daostack.dxSchemes && Object.keys(networkConfig.daostack.dxSchemes).indexOf(schemeAddress) > -1) {
          return {
            type: "OldDxScheme",
            votingMachine: networkConfig.votingMachines.gen.address,
            contractToCall: ZERO_ADDRESS,
            name: networkConfig.daostack.dxSchemes[schemeAddress],
            newProposalTopics: [],
            creationLogEncoding: []
          };
        }
      }
      return {
        type: "WalletScheme",
        votingMachine: networkConfig.votingMachines.dxd.address,
        name: "WalletScheme",
        newProposalTopics: [[
          web3.utils.soliditySha3("ProposalStateChange(bytes32,uint256)"),
          null,
          '0x0000000000000000000000000000000000000000000000000000000000000001']
        ],
        creationLogEncoding: []
      }
    }

    getTokenData(tokenAddress) {
      return this.appConfig[this.getActiveChainName()]
        .tokens.find((tokenInFile) => tokenInFile.address == tokenAddress);
    }

    getTokensOfNetwork() {
      return this.appConfig[this.getActiveChainName()].tokens;
    }

    getTokensToFetchPrice() {
      return this.appConfig[this.getActiveChainName()].tokens.filter((tokenInFile) => tokenInFile.fetchPrice);
    }

    getProposalTemplates() {
      return this.appConfig[this.getActiveChainName()].proposalTemplates;
    }

    getRecommendedCalls() {
      const networkName = this.getActiveChainName();
      const networkConfig = this.getNetworkConfig();
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
          decimals ?: number;
        }[];
        decodeText: string;
      }[] = [
        {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "sendEther(uint256,address,address)",
          params: [
            {type: "uint256", name: "_amountInWei", defaultValue: "", decimals: 18},
            {type: "address", name: "_to", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Send [PARAM_0] "+NETWORK_ASSET_SYMBOL[networkName]+" to [PARAM_1]"
        },{
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "externalTokenTransfer(address,address,uint256,address)",
          params: [
            {type: "address", name: "_externalToken", defaultValue: ""},
            {type: "address", name: "_to", defaultValue: ""},
            {type: "uint256", name: "_value", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Send [PARAM_2] token([PARAM_0]) to [PARAM_1]"
        },{
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "mintReputation(uint256,address,address)",
          params: [
            {type: "uint256", name: "_amount", defaultValue: "", decimals: 18},
            {type: "address", name: "_to", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Mint of [PARAM_0] REP to [PARAM_1]"
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "burnReputation(uint256,address,address)",
          params: [
            {type: "uint256", name: "_amount", defaultValue: "", decimals: 18},
            {type: "address", name: "_from", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Burn of [PARAM_0] REP to [PARAM_1]"
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "registerScheme(address,bytes32,bytes4,address)",
          params: [
            {type: "address", name: "_scheme", defaultValue: ""},
            {type: "bytes32", name: "_paramsHash", defaultValue: ""},
            {type: "bytes4", name: "_permissions", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Register scheme [PARAM_0] with params hash [PARAM_1] and permissions [PARAM_2]"
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "unregisterScheme(address,address)",
          params: [
            {type: "address", name: "_scheme", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
          ],
          decodeText: "Unregister scheme [PARAM_0]"
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.controller,
          toName: "DXdao Controller",
          functionName: "genericCall(address,bytes,addres,uint256)",
          params: [
            {type: "address", name: "_contract", defaultValue: ""},
            {type: "bytes", name: "_data", defaultValue: ""},
            {type: "address", name: "_avatar", defaultValue: networkConfig.avatar},
            {type: "uint256", name: "_value", defaultValue: ""}
          ],
          decodeText: "Generic call to [PARAM_0] with data [PARAM_1] and value [PARAM_2] "+NETWORK_ASSET_SYMBOL[networkName]
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.permissionRegistry,
          toName: "Permission Registry",
          functionName: "setTimeDelay(uint256)",
          params: [
            {type: "uint256", name: "newTimeDelay", defaultValue: ""},
          ],
          decodeText: "Set time delay to [PARAM_0] seconds"
        }, {
          asset: ZERO_ADDRESS,
          from: networkConfig.avatar,
          to: networkConfig.permissionRegistry,
          toName: "Permission Registry",
          functionName: "setAdminPermission(address,address,address,bytes4,uint256,bool)",
          params: [
            {type: "address", name: "asset", defaultValue: ZERO_ADDRESS},
            {type: "address", name: "from", defaultValue: ""},
            {type: "address", name: "to", defaultValue: ""},
            {type: "bytes4", name: "functionSignature", defaultValue: ANY_FUNC_SIGNATURE},
            {type: "uint256", name: "valueAllowed", defaultValue: "0"},
            {type: "bool", name: "allowed", defaultValue: "true"},
          ],
          decodeText: "Set [PARAM_5] admin permission in asset [PARAM_0] from [PARAM_1] to [PARAM_2] with function signature [PARAM_3] and value [PARAM_4]"
        }, {
          asset: ZERO_ADDRESS,
          from: ANY_ADDRESS,
          to: networkConfig.permissionRegistry,
          toName: "Permission Registry",
          functionName: "setPermission(address,address,bytes4,uint256,bool)",
          params: [
            {type: "address", name: "asset", defaultValue: ZERO_ADDRESS},
            {type: "address", name: "to", defaultValue: ""},
            {type: "bytes4", name: "functionSignature", defaultValue: ""},
            {type: "uint256", name: "valueAllowed", defaultValue: ""},
            {type: "bool", name: "allowed", defaultValue: ""},
          ],
          decodeText: "Set [PARAM_5] permission in asset [PARAM_0] from [FROM] to [PARAM_2] with function signature [PARAM_3] and value [PARAM_4]"
        }
      ];
      
      if (this.appConfig[networkName].recommendedCalls && this.appConfig[networkName].recommendedCalls.length > 0)
        recommendedCalls = recommendedCalls.concat(this.appConfig[networkName].recommendedCalls);
      
      networkTokens.map((networkToken) => {
        recommendedCalls.push({
          asset: networkToken.address,
          from: ANY_ADDRESS,
          to: networkToken.address,
          toName: networkToken.name,
          functionName: "transfer(address,uint256)",
          params: [
            {type: "address", name: "to", defaultValue: ""},
            {type: "uint256", name: "value", defaultValue: "0", decimals: networkToken.decimals}
          ],
          decodeText: "Transfer [PARAM_1] "+networkToken.symbol+" to [PARAM_0]"
        });

        recommendedCalls.push({
          asset: networkToken.address,
          from: ANY_ADDRESS,
          to: networkToken.address,
          toName: `ERC20 ${networkToken.symbol}`,
          functionName: "approve(address,uint256)",
          params: [
            {type: "address", name: "to", defaultValue: ""},
            {type: "uint256", name: "value", defaultValue: "0", decimals: networkToken.decimals}
          ],
          decodeText: "Approve [PARAM_1] "+networkToken.symbol+" to [PARAM_0]"
        });
      });
      
      return recommendedCalls;
    }
}
