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
import { useEffect, useState } from 'react';

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
  console.log({ sigHash });
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
  return {
    contractInterface: registryContract.contractInterface,
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

const decodeCall = async (
  call: Call,
  contracts: RegistryContract[],
  chainId: number
) => {
  let decodedCall: DecodedCall = null;
  if (chainId === 1337) {
    return null;
  }
  // Detect using the Guild calls registry.
  const matchedRegistryContract = contracts?.find(
    contract => contract.networks[chainId] === call.to
  );

  let matchedContractData = matchedRegistryContract
    ? getContractInterfaceFromRegistryContract(matchedRegistryContract)
    : getContractFromKnownSighashes(call.data);

  if (!matchedContractData && chainId !== 1337) {
    const abi = await lookUpContractWithSourcify({ chainId, address: call.to });

    matchedContractData = {
      contractInterface: new utils.Interface(abi),
      callType: SupportedAction.GENERIC_CALL,
    };
  }
  console.log({ matchedContractData });
  const { callType, contractInterface } = matchedContractData;
  if (!contractInterface) return null;
  decodedCall = decodeCallUsingEthersInterface(
    call,
    contractInterface,
    callType
  );
  return {
    id: `action-${Math.random()}`,
    decodedCall,
    contract: contractInterface,
  };
};

export const bulkDecodeCallsFromOptions = (
  options: Option[],
  contracts: RegistryContract[],
  chainId: number
) => {
  console.log('gets called');
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

const lookUpContractWithSourcify = async ({ chainId, address }) => {
  const baseUrl = `https://sourcify.dev/server/files/any`;
  const url = `${baseUrl}/4/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const json = await response.json();
  if (!json.files) return null;
  return JSON.parse(json.files.find(f => f.name === 'metadata.json').content)
    .output.abi;
};

export const useDecodedCall = (call: Call) => {
  const [decodedCall, setDecodedCall] = useState<any>(null);
  const { chainId } = useWeb3React();
  const { contracts } = useContractRegistry();
  useEffect(() => {
    if (call) {
      decodeCall(call, contracts, chainId).then(decodedData =>
        setDecodedCall(decodedData)
      );
    } else {
      setDecodedCall(null);
    }
  }, [call, contracts, chainId]);

  return decodedCall || { decodedCall: null, contract: null };
};
