import { utils } from 'ethers';
import {
  RichContractData,
  useRichContractRegistry,
} from './useRichContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import ERC20Guild from '../../../contracts/ERC20Guild.json';
import { useWeb3React } from '@web3-react/core';
import {
  Call,
  DecodedCall,
  Option,
  SupportedAction,
} from 'old-components/Guilds/ActionsBuilder/types';
import { ERC20_APPROVE_SIGNATURE, ERC20_TRANSFER_SIGNATURE } from 'utils';

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
    '0xa5234bce': {
      callType: SupportedAction.SET_PERMISSIONS,
      ABI: ERC20Guild.abi,
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

export const decodeCall = (
  call: Call,
  contracts: RichContractData[],
  chainId: number
) => {
  let decodedCall: DecodedCall = null;

  // Detect using the Guild calls registry.
  const matchedRichContractData = contracts?.find(
    contract => contract.networks[chainId] === call.to
  );
  const matchedContract = matchedRichContractData
    ? getContractInterfaceFromRichContractData(matchedRichContractData)
    : getContractFromKnownSighashes(call.data);
  if (!matchedContract) return null;

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
  return options.map(option => {
    const { actions } = option;
    const decodedCalls = actions?.map(call =>
      decodeCall(call, contracts, chainId)
    );
    return {
      ...option,
      decodedActions: decodedCalls,
    };
  });
};

export const useDecodedCall = (call: Call) => {
  const { chainId } = useWeb3React();
  const { contracts } = useRichContractRegistry();
  const decodedData = call ? decodeCall(call, contracts, chainId) : null;
  return decodedData || { decodedCall: null, contract: null, approval: null };
};
