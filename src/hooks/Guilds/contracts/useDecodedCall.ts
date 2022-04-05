import { utils } from 'ethers';
import { RegistryContract, useContractRegistry } from './useContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import {
  Call,
  DecodedCall,
  Option,
  SupportedAction,
} from 'components/Guilds/ActionsBuilder/types';

const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';
const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';

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

const getContractInterfaceFromRegistryContract = (
  registryContract: RegistryContract
) => {
  // Construct the interface for the contract.
  const contractInterface = new utils.Interface(
    registryContract.functions.map(f => {
      const name = f.functionName;
      const params = f.params.reduce(
        (acc, cur) => acc.concat(`${cur.type} ${cur.name}`),
        ''
      );
      return `function ${name}(${params})`;
    })
  );

  return { contractInterface, callType: SupportedAction.GENERIC_CALL };
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

const decodeCall = (
  call: Call,
  contracts: RegistryContract[],
  chainId: number
) => {
  let decodedCall: DecodedCall = null;

  // Detect using the Guild calls registry.
  const matchedRegistryContract = contracts?.find(
    contract => contract.networks[chainId] === call.to
  );
  const matchedContractData = matchedRegistryContract
    ? getContractInterfaceFromRegistryContract(matchedRegistryContract)
    : getContractFromKnownSighashes(call.data);

  if (!matchedContractData) return null;

  const { callType, contractInterface } = matchedContractData;
  if (!contractInterface) return null;

  decodedCall = decodeCallUsingEthersInterface(
    call,
    contractInterface,
    callType
  );

  return {
    decodedCall,
    contract: contractInterface,
  };
};

export const bulkDecodeCallsFromOptions = (
  options: Option[],
  contracts: RegistryContract[],
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
  const { contracts } = useContractRegistry();

  return call
    ? decodeCall(call, contracts, chainId)
    : { decodedCall: null, contract: null };
};
