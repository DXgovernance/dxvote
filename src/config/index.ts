const contractsFile = require('./contracts.json');
const dataFile = require('./data.json');
const Web3 = require('web3');

const web3 = new Web3();

export const getNetworkConfig = function(network) {
  const networkData = dataFile[network] || {
    tokens: {}
  };
  let networkConfig;

  if (network === 'localhost') {
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
  } else  if (network == 'mainnet') {
    networkConfig = contractsFile[network];
    const avatarAddressEncoded = web3.eth.abi.encodeParameter('address', networkConfig.avatar);
    
    networkConfig.daostack = {
      
      "dxSchemes": {
        "0x2E6FaE82c77e1D6433CCaAaF90281523b99D0D0a": "DxLockMgnForRep",
        "0x4D8DB062dEFa0254d00a44aA1602C30594e47B12": "DxGenAuction4Rep",
        "0x4564BFe303900178578769b2D76B1a13533E5fd5": "DxLockEth4Rep",
        "0x1cb5B2BB4030220ad5417229A7A1E3c373cDD2F6": "DxLockWhitelisted4Rep"
      },
      
      "schemeRegistrar": {
        "address": "0xf050F3C6772Ff35eB174A6900833243fcCD0261F",
        "contractToCall": "0x9f828ac3baa9003e8a4e0b24bcae7b027b6740b0",
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
        "contractToCall": "0x9f828ac3baa9003e8a4e0b24bcae7b027b6740b0",
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
          "0xef9dC3c39CA40A2a3000ACc5ca0467CE1C250808": "Multicall_1",
          "0x34C42c3ee81A03FD9ea773987b4a6eF62f3fc151": "Multicall_2",
          "0x0f4775722a72FA85230c63598e661eC52563Fb4E": "Multicall_3"
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
    
  } else {
    networkConfig = contractsFile[network];
  };
  
  if (networkConfig && networkConfig.votingMachines.dxd)
    networkData.tokens[networkConfig.votingMachines.dxd.token] = {
      name: "DXD", decimals: 18
    };
  if (networkConfig && networkConfig.votingMachines.gen)
    networkData.tokens[networkConfig.votingMachines.gen.token] = {
      name: "GEN", decimals: 18
    };
  return Object.assign(networkData, networkConfig);

}

export const getSchemeTypeData = function(network, schemeAddress) {
  const networkConfig = getNetworkConfig(network);

  if (networkConfig.daostack) {
    if (networkConfig.daostack.schemeRegistrar.address == schemeAddress) {
      return {
        type: "SchemeRegistrar",
        name: "SchemeRegistrar",
        contractToCall: networkConfig.daostack.schemeRegistrar.contractToCall,
        votingMachine: networkConfig.votingMachines.gen.address,
        newProposalTopics: networkConfig.daostack.schemeRegistrar.newProposalTopics,
        creationLogEncoding: networkConfig.daostack.schemeRegistrar.creationLogEncoding
      };
    } else if (networkConfig.daostack.contributionReward.address == schemeAddress) {
      return {
        type: "ContributionReward",
        name: "ContributionReward",
        contractToCall: networkConfig.daostack.contributionReward.contractToCall,
        votingMachine: networkConfig.votingMachines.gen.address,
        newProposalTopics: networkConfig.daostack.contributionReward.newProposalTopics,
        creationLogEncoding: networkConfig.daostack.contributionReward.creationLogEncoding
      };
    } else if (Object.keys(networkConfig.daostack.multicallSchemes.addresses).indexOf(schemeAddress) > -1) {
      return {
        type: "GenericMulticall",
        votingMachine: networkConfig.votingMachines.gen.address,
        contractToCall: "0x0000000000000000000000000000000000000000",
        name: networkConfig.daostack.multicallSchemes.addresses[schemeAddress],
        newProposalTopics: networkConfig.daostack.multicallSchemes.newProposalTopics,
        creationLogEncoding: networkConfig.daostack.multicallSchemes.creationLogEncoding
      };
    } else if (Object.keys(networkConfig.daostack.genericSchemes.addresses).indexOf(schemeAddress) > -1) {
      return {
        type: "GenericScheme",
        votingMachine: networkConfig.daostack.genericSchemes.addresses[schemeAddress].votingMachine,
        contractToCall: networkConfig.daostack.genericSchemes.addresses[schemeAddress].contractToCall,
        name: networkConfig.daostack.genericSchemes.addresses[schemeAddress].name,
        newProposalTopics: networkConfig.daostack.genericSchemes.newProposalTopics,
        voteParams: networkConfig.daostack.genericSchemes.addresses[schemeAddress].voteParams,
        creationLogEncoding: networkConfig.daostack.genericSchemes.creationLogEncoding
      };
    } else if (Object.keys(networkConfig.daostack.dxSchemes).indexOf(schemeAddress) > -1) {
      return {
        type: "OldDxScheme",
        votingMachine: networkConfig.votingMachines.gen.address,
        contractToCall: "0x0000000000000000000000000000000000000001",
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
