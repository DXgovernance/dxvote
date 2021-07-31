const { getNetworkConfig, getTokensOfNetwork } = require('./index');
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE } from '../utils';

export const getRecommendedCalls = function(network) {
  const networkConfig = getNetworkConfig(network);
  const networkTokens = getTokensOfNetwork(network);
  
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
      decodeText: "Generic call to [PARAM_0] with data [PARAM_1] and value [PARAM_2] ETH"
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
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "transferPairOwnership(address,address)",
      params: [
        {type: "address", name: "pair", defaultValue: ""},
        {type: "address", name: "newOwner", defaultValue: ""},
      ],
      decodeText: "Transfer swpr pair [PARAM_0] ownership to [PARAM_1]"
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "setProtocolFee(uint8)",
      params: [
        {type: "uint8", name: "protocolFeeDenominator", defaultValue: ""}
      ],
      decodeText: "Set swpr protocol fee denominator to [PARAM_0]"
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "setSwapFee(address,uint32)",
      params: [
        {type: "address", name: "pair", defaultValue: ""},
        {type: "uint32", name: "swapFee", defaultValue: ""}
      ],
      decodeText: "Set swpr fee for pair [PARAM_0] to [PARAM_1]"
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0xaE909196e549587b8Dc0D26cdbf05B754BB580B3",
      toName: "Swpr Fee Receiver",
      functionName: "takeProtocolFee(address[])",
      params: [
        {type: "address[]", name: "pairs", defaultValue: ""},
      ],
      decodeText: "Take protocol fee from swpr pairs [PARAM_0]"
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x8EEaea23686c319133a7cC110b840d1591d9AeE0",
      toName: "Swpr Router",
      functionName: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
      params: [
        {type: "address", name: "tokenA", defaultValue: ""},
        {type: "address", name: "tokenB", defaultValue: ""},
        {type: "uint256", name: "amountADesired", defaultValue: ""},
        {type: "uint256", name: "amountBDesired", defaultValue: ""},
        {type: "uint256", name: "amountAMin", defaultValue: ""},
        {type: "uint256", name: "amountBMin", defaultValue: ""},
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "deadline", defaultValue: ""}
      ],
      decodeText: "Add liquidity with [PARAM_2] value of token [PARAM_0] and [PARAM_4] value of token [PARAM_1] to address [PARAM_6]"
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x8EEaea23686c319133a7cC110b840d1591d9AeE0",
      toName: "Swpr Router",
      functionName: "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)",
      params: [
        {type: "address", name: "tokenA", defaultValue: ""},
        {type: "address", name: "tokenB", defaultValue: ""},
        {type: "uint256", name: "liquidity", defaultValue: ""},
        {type: "uint256", name: "amountAMin", defaultValue: ""},
        {type: "uint256", name: "amountBMin", defaultValue: ""},
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "deadline", defaultValue: ""}
      ],
      decodeText: "Remove and send [PARAM_2] liquidity tokens from pool with tokens [PARAM_0] - [PARAM_1] to address [PARAM_5]"
    }
  ];
  
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
