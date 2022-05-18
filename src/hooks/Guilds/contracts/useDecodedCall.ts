import { utils } from 'ethers';
import {
  RichContractData,
  useRichContractRegistry,
} from './useRichContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import {
  Call,
  DecodedCall,
  Option,
  SupportedAction,
} from 'old-components/Guilds/ActionsBuilder/types';
import { ERC20_APPROVE_SIGNATURE, ERC20_TRANSFER_SIGNATURE } from 'utils';
import { useEffect, useRef, useState } from 'react';
import { lookUpContractWithSourcify } from 'utils/sourcify';

const knownSigHashes: Record<string, { callType: SupportedAction; ABI: any }> =
  {
    [ERC20_TRANSFER_SIGNATURE]: {
      callType: SupportedAction.ERC20_TRANSFER,
      ABI: ERC20ABI,
    },
    [ERC20_APPROVE_SIGNATURE]: {
      callType: SupportedAction.GENERIC_CALL,
      ABI: ERC20ABI,
    },
  };

const decodeCallUsingEthersInterface = (
  call: Call,
  contractInterface: utils.Interface,
  callType?: SupportedAction
): DecodedCall => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = call.data.substring(0, 10);

  // Find the ABI function fragment for the sighash.
  const functionFragment = contractInterface.getFunction(sigHash);
  if (!functionFragment) return null;

  // Decode the function parameters.
  const params = contractInterface.decodeFunctionData(
    functionFragment,
    call.data
  );

  const paramsJson = functionFragment.inputs.reduce((acc, input) => {
    acc[input.name] = params[input.name];
    return acc;
  }, {} as Record<string, any>);

  return {
    callType: callType || SupportedAction.GENERIC_CALL,
    from: call.from,
    to: call.to,
    value: call.value,
    function: functionFragment,
    args: paramsJson,
  };
};

const getContractInterfaceFromRichContractData = (
  richContractData: RichContractData
) => {
  return {
    contractInterface: richContractData.contractInterface,
    callType: SupportedAction.GENERIC_CALL,
  };
};

const getContractFromKnownSighashes = (data: string) => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Heuristic detection using known sighashes
  const match = knownSigHashes[sigHash];
  if (!match) return null;

  let contractInterface = new utils.Interface(match.ABI);
  return {
    contractInterface,
    callType: match.callType,
  };
};

export const decodeCall = async (
  call: Call,
  contracts: RichContractData[],
  chainId: number
) => {
  let decodedCall: DecodedCall = null;

  // Detect using the Guild calls registry.
  const matchedRichContractData = contracts?.find(
    contract => contract.networks[chainId] === call.to
  );
  let matchedContract = matchedRichContractData
    ? getContractInterfaceFromRichContractData(matchedRichContractData)
    : getContractFromKnownSighashes(call.data);
  if (!matchedContract) {
    const abi = await lookUpContractWithSourcify({ chainId, address: call.to });
    matchedContract = {
      contractInterface: new utils.Interface(abi),
      callType: SupportedAction.GENERIC_CALL,
    };
  }
  const { callType, contractInterface } = matchedContract;
  if (!contractInterface) return null;

  decodedCall = decodeCallUsingEthersInterface(
    call,
    contractInterface,
    callType
  );

  if (decodedCall && matchedRichContractData) {
    decodedCall.richData = matchedRichContractData;
  }

  return {
    id: `action-${Math.random()}`,
    decodedCall,
    contract: contractInterface,
    approval: call.approval || null,
  };
};

export const bulkDecodeCallsFromOptions = (
  options: Option[],
  contracts: RichContractData[],
  chainId: number
) => {
  return Promise.all(
    options.map(async option => {
      const { actions } = option;
      const actionPromisesArray = actions.map(
        async action => await decodeCall(action, contracts, chainId)
      );
      const decodedActions = await Promise.all(actionPromisesArray);
      return {
        ...option,
        decodedActions,
      };
    })
  );
};

export const useDecodedCall = (call: Call) => {
  const [decodedCall, setDecodedCall] = useState<any>(null);
  const isCancelled = useRef(false);
  const { chainId } = useWeb3React();
  const { contracts } = useRichContractRegistry();

  useEffect(() => {
    if (call && !isCancelled.current) {
      decodeCall(call, contracts, chainId).then(decodedData =>
        setDecodedCall(decodedData)
      );
    } else {
      setDecodedCall(null);
    }
    return () => {
      isCancelled.current = true;
    };
  }, [call, contracts, chainId]);

  return decodedCall || { decodedCall: null, contract: null, approval: null};
};
