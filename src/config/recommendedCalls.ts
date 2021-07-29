const { getNetworkConfig, getTokensOfNetwork } = require('./index');
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE } from '../utils/helpers';

export const getRecommendedCalls = function(network) {
  const networkConfig = getNetworkConfig(network);
  const networkTokens = getTokensOfNetwork(network);
  
  let recommendedCalls = [
    {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.controller,
      toName: "DXdao Controller",
      functionName: "mintReputation(uint256,address,address)",
      functionSignature: "0xeaf994b2",
      params: [
        {type: "uint256", name: "_amount", defaultValue: ""},
        {type: "address", name: "_to", defaultValue: ""},
        {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.controller,
      toName: "DXdao Controller",
      functionName: "burnReputation(uint256,address,address)",
      functionSignature: "0x6e94d278",
      params: [
        {type: "uint256", name: "_amount", defaultValue: ""},
        {type: "address", name: "_from", defaultValue: ""},
        {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.controller,
      toName: "DXdao Controller",
      functionName: "registerScheme(address,bytes32,bytes4,address)",
      functionSignature: "0xe869d45f",
      params: [
        {type: "address", name: "_scheme", defaultValue: ""},
        {type: "bytes32", name: "_paramsHash", defaultValue: ""},
        {type: "bytes4", name: "_permissions", defaultValue: ""},
        {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
      ]
    }, {
      from: networkConfig.avatar,
      to: networkConfig.controller,
      toName: "DXdao Controller",
      functionName: "unregisterScheme(address,address)",
      functionSignature: "0x039de01d",
      params: [
        {type: "address", name: "_scheme", defaultValue: ""},
        {type: "address", name: "_avatar", defaultValue: networkConfig.avatar}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.controller,
      toName: "DXdao Controller",
      functionName: "genericCall(address,bytes,addres,uint256)",
      functionSignature: "0x92641aaa",
      params: [
        {type: "address", name: "_contract", defaultValue: ""},
        {type: "bytes", name: "_data", defaultValue: ""},
        {type: "address", name: "_avatar", defaultValue: networkConfig.avatar},
        {type: "uint256", name: "_value", defaultValue: ""}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.permissionRegistry,
      toName: "Permission Registry",
      functionName: "setTimeDelay(uint256)",
      functionSignature: "0x39af6ba9",
      params: [
        {type: "uint256", name: "newTimeDelay", defaultValue: ""},
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: networkConfig.avatar,
      to: networkConfig.permissionRegistry,
      toName: "Permission Registry",
      functionName: "setAdminPermission(address,address,address,bytes4,uint256,bool)",
      functionSignature: "0x969e6fbd",
      params: [
        {type: "address", name: "asset", defaultValue: ZERO_ADDRESS},
        {type: "address", name: "from", defaultValue: ""},
        {type: "address", name: "to", defaultValue: ""},
        {type: "bytes4", name: "functionSignature", defaultValue: ANY_FUNC_SIGNATURE},
        {type: "uint256", name: "valueAllowed", defaultValue: "0"},
        {type: "bool", name: "allowed", defaultValue: "true"},
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: networkConfig.permissionRegistry,
      toName: "Permission Registry",
      functionName: "setPermission(address,address,bytes4,uint256,bool)",
      functionSignature: "0x9b2dccdd",
      params: [
        {type: "address", name: "asset", defaultValue: ZERO_ADDRESS},
        {type: "address", name: "to", defaultValue: ""},
        {type: "bytes4", name: "functionSignature", defaultValue: ""},
        {type: "uint256", name: "valueAllowed", defaultValue: ""},
        {type: "bool", name: "allowed", defaultValue: ""},
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "transferPairOwnership(address,address)",
      functionSignature: "0xa6dab93f",
      params: [
        {type: "address", name: "pair", defaultValue: ""},
        {type: "address", name: "newOwner", defaultValue: ""},
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "setProtocolFee(uint8)",
      functionSignature: "0x4e91f811",
      params: [
        {type: "uint8", name: "protocolFeeDenominator", defaultValue: ""}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x317113D2593e3efF1FfAE0ba2fF7A61861Df7ae5",
      toName: "Swpr Fee Setter",
      functionName: "setSwapFee(address,uint32)",
      functionSignature: "0x9e68ceb8",
      params: [
        {type: "address", name: "pair", defaultValue: ""},
        {type: "uint32", name: "swapFee", defaultValue: ""}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0xaE909196e549587b8Dc0D26cdbf05B754BB580B3",
      toName: "Swpr Fee Receiver",
      functionName: "takeProtocolFee(address[])",
      functionSignature: "0x5cb9c4ec",
      params: [
        {type: "address[]", name: "pairs", defaultValue: ""},
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x8EEaea23686c319133a7cC110b840d1591d9AeE0",
      toName: "Swpr Router",
      functionName: "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
      functionSignature: "0xe8e33700",
      params: [
        {type: "address", name: "tokenA", defaultValue: ""},
        {type: "address", name: "tokenB", defaultValue: ""},
        {type: "uint256", name: "amountADesired", defaultValue: ""},
        {type: "uint256", name: "amountBDesired", defaultValue: ""},
        {type: "uint256", name: "amountAMin", defaultValue: ""},
        {type: "uint256", name: "amountBMin", defaultValue: ""},
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "deadline", defaultValue: ""}
      ]
    }, {
      asset: ZERO_ADDRESS,
      from: ANY_ADDRESS,
      to: "0x8EEaea23686c319133a7cC110b840d1591d9AeE0",
      toName: "Swpr Router",
      functionName: "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)",
      functionSignature: "0xbaa2abde",
      params: [
        {type: "address", name: "tokenA", defaultValue: ""},
        {type: "address", name: "tokenB", defaultValue: ""},
        {type: "uint256", name: "liquidity", defaultValue: ""},
        {type: "uint256", name: "amountAMin", defaultValue: ""},
        {type: "uint256", name: "amountBMin", defaultValue: ""},
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "deadline", defaultValue: ""}
      ]
    }
  ];
  
  networkTokens.map((networkToken) => {
    recommendedCalls.push({
      asset: networkToken.address,
      to: networkToken.address,
      toName: networkToken.name,
      functionName: "transfer(address,uint256)",
      functionSignature: "0xa9059cbb",
      params: [
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "value", defaultValue: "0"}
      ]
    });

    recommendedCalls.push({
      asset: networkToken.address,
      to: networkToken.address,
      toName: `ERC20 ${networkToken.symbol}`,
      functionName: "approve(address,uint256)",
      functionSignature: "0x095ea7b3",
      params: [
        {type: "address", name: "to", defaultValue: ""},
        {type: "uint256", name: "value", defaultValue: "0"}
      ]
    });
  });
  
  return recommendedCalls;
}
