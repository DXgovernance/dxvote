import { useState } from 'react';
import { ContractType } from 'stores/Provider';
import { ProposalCalls } from '../types/types';
import {
  ANY_ADDRESS,
  bnum,
  ERC20_APPROVE_SIGNATURE,
  ERC20_TRANSFER_SIGNATURE,
  ZERO_ADDRESS,
  BigNumber,
} from 'utils';
import { useContext } from '../contexts';

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
    try {
      const abi = abiService.decodeCall(data, contract, contractABI);
      setABI(abi);
      return abi;
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const decodedCallData = (
    from: string,
    to: string,
    data: string,
    value: BigNumber,
    contractABI: string
  ) => {
    const { library } = providerStore.getActiveWeb3React();
    const recommendedCalls = configStore.getRecommendedCalls();
    let functionSignature = data.substring(0, 10);

    const controllerCallDecoded = abiService.decodeCall(
      data,
      ContractType.Controller
    );
    const decodedAbi = decodeABI({ data, contractABI });

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

      return {
        from: from,
        to: to,
        recommendedCallUsed: recommendedCallUsed,
        encodedFunctionName: encodeFunctionName,
        callParameters: callParameters,
        data: data,
        value: value,
        contractABI: decodedAbi,
      };
    }

    return {
      from: from,
      to: to,
      data: data,
      value: value,
      functionSignature: functionSignature,
      contractABI: decodedAbi,
    };
  };

  return {
    ABI,
    decodedCallData,
  };
};
