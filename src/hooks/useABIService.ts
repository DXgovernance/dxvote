import React, { useState } from 'react';
import { ContractType } from 'stores/Provider';
import {
  ANY_ADDRESS,
  bnum,
  ERC20_APPROVE_SIGNATURE,
  ERC20_TRANSFER_SIGNATURE,
  ZERO_ADDRESS,
  BigNumber,
  normalizeBalance,
} from 'utils';
import { useContext } from '../contexts';
import { useEtherscanService } from './useEtherscanService';

interface RecommendedCallsUsed {
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
}

interface DecodedABI {
  function: any;
  args: any;
}
interface DecodeABI {
  data: string;
  contractType?: ContractType;
}
interface UseABIServiceReturns {
  ABI: DecodedABI | undefined;
  loading: boolean;
  error: Error | null;
  decodedCallData: (
    from: string,
    to: string,
    data: string,
    value: BigNumber,
    fullDescription: boolean
  ) => {
    from: string;
    to: string;
    data: string;
    value: BigNumber;
    args?: any;
    functions?: any;
    recommendedCallsUsed?: RecommendedCallsUsed | undefined;
    callParamaters?: string | undefined;
    decodedCallText?: string | undefined;
  };
}
/**
 * parse's ABI and returns a react component detailing the to, from, and functions calls
 */
export const useABIService = (address: string): UseABIServiceReturns => {
  const [ABI, setABI] = useState<DecodedABI>();
  const { contractABI, loading, error } = useEtherscanService(address);
  const {
    context: { abiService, providerStore, configStore },
  } = useContext();

  const decodeABI = (params: DecodeABI) => {
    let contract: ContractType | undefined;
    const { data, contractType } = params;
    if (contractType) {
      contract = contractType;
    }
    const abi = abiService.decodeCall(data, contract, contractABI);
    setABI(abi);
  };

  const decodedCallData = (
    from: string,
    to: string,
    data: string,
    value: BigNumber,
    fullDescription: boolean
  ) => {
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    let functionSignature = data.substring(0, 10);

    const controllerCallDecoded = abiService.decodeCall(
      data,
      ContractType.Controller
    );
    decodeABI({ data });

    if (ABI) {
      return {
        from: from,
        to: to,
        args: ABI.args,
        functions: ABI.function,
        data: data,
        value: value,
      };
    }
    if (
      controllerCallDecoded &&
      controllerCallDecoded.function.name === 'genericCall'
    ) {
      to = controllerCallDecoded.args[0];
      data = '0x' + controllerCallDecoded.args[1].substring(10);
      value = bnum(controllerCallDecoded.args[3]);
      functionSignature = controllerCallDecoded.args[1].substring(0, 10);
    } else {
      data = '0x' + data.substring(10);
    }

    let asset = ZERO_ADDRESS;
    if (
      functionSignature === ERC20_TRANSFER_SIGNATURE ||
      functionSignature === ERC20_APPROVE_SIGNATURE
    ) {
      asset = to;
    }
    const recommendedCallUsed = recommendedCalls.find(recommendedCall => {
      return (
        asset === recommendedCall.asset &&
        (ANY_ADDRESS === recommendedCall.from ||
          from === recommendedCall.from) &&
        to === recommendedCall.to &&
        functionSignature ===
          library.eth.abi.encodeFunctionSignature(recommendedCall.functionName)
      );
    });

    if (recommendedCallUsed) {
      const callParameters = library.eth.abi.decodeParameters(
        recommendedCallUsed.params.map(param => param.type),
        data
      );

      if (callParameters.__length__) delete callParameters.__length__;

      let encodeFunctionName = library.eth.abi.encodeFunctionSignature(
        recommendedCallUsed.functionName
      );

      let decodedCallText = '';

      if (
        recommendedCallUsed.decodeText &&
        recommendedCallUsed.decodeText.length > 0
      ) {
        decodedCallText = recommendedCallUsed.decodeText;

        for (
          let paramIndex = 0;
          paramIndex < recommendedCallUsed.params.length;
          paramIndex++
        )
          if (recommendedCallUsed.params[paramIndex].decimals)
            decodedCallText = decodedCallText.replaceAll(
              '[PARAM_' + paramIndex + ']',
              '<italic>' +
                normalizeBalance(
                  callParameters[paramIndex],
                  recommendedCallUsed.params[paramIndex].decimals
                ) +
                '</italic>'
            );
          else
            decodedCallText = decodedCallText.replaceAll(
              '[PARAM_' + paramIndex + ']',
              '<italic>' + callParameters[paramIndex] + '</italic>'
            );
      }

      if (fullDescription) {
        return {
          from: from,
          to: to,
          recommendedCallUsed: recommendedCallUsed,
          encodedFunctionName: encodeFunctionName,
          callParamaters: callParameters,
          data: data,
          value: value,
        };
      } else {
        return {
          from: from,
          to: to,
          data: data,
          value: value,
          decodedCallText: decodedCallText,
        };
      }
    }

    return {
      from: from,
      to: to,
      data: data,
      value: value,
      functionSignature: functionSignature,
    };
  };

  return {
    ABI,
    loading,
    error,
    decodedCallData,
  };
};
