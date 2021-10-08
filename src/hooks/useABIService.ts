import { useState } from 'react';
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

export interface ProposalCalls {
  from: string;
  to: string;
  data: string;
  value: BigNumber;
  recommendedCallUsed?: RecommendedCallUsed | undefined;
  callParamaters?: string | undefined;
  decodedCallText?: string | undefined;
  encodedFunctionName?: string | undefined;
}

interface RecommendedCallUsed {
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
  contractABI?: string;
}
interface UseABIServiceReturns {
  ABI: DecodedABI | undefined;
  decodedCallData: (
    from: string,
    to: string,
    data: string,
    value: BigNumber,
    ABI: string
  ) => ProposalCalls;
}
/**
 * parse's ABI and returns a react component detailing the to, from, and functions calls
 */
export const useABIService = (): UseABIServiceReturns => {
  const [ABI, setABI] = useState<DecodedABI>();
  const {
    context: { abiService, providerStore, configStore },
  } = useContext();

  const decodeABI = (params: DecodeABI) => {
    let contract: ContractType | undefined;
    const { data, contractType, contractABI } = params;
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
    contractABI: any
  ) => {
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    let functionSignature = data.substring(0, 10);

    const controllerCallDecoded = abiService.decodeCall(
      data,
      ContractType.Controller
    );
    decodeABI({ data, contractABI });

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

      return {
        from: from,
        to: to,
        recommendedCallUsed: recommendedCallUsed,
        encodedFunctionName: encodeFunctionName,
        callParamaters: callParameters,
        data: data,
        value: value,
        decodedCallText: decodedCallText,
      };
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
    decodedCallData,
  };
};
