import { utils } from 'ethers';
import { RegistryContract, useContractRegistry } from './useContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import { useWeb3React } from '@web3-react/core';
import { Call } from 'components/Guilds/CreateProposalPage';
import { SupportedAction } from 'components/Guilds/CreateProposalPage/ActionsBuilder/SupportedActions';

const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';
const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';

const knownSigHashes = {
  [ERC20_TRANSFER_SIGNATURE]: {
    callType: SupportedAction.ERC20_TRANSFER,
    ABI: ERC20ABI,
  },
  [ERC20_APPROVE_SIGNATURE]: {
    callType: SupportedAction.GENERIC_CALL,
    ABI: ERC20ABI,
  },
};

export interface DecodedCall {
  callType: SupportedAction;
  function: utils.FunctionFragment;
  args: utils.Result;
}

const decodeCallUsingEthersInterface = (
  data: string,
  contractInterface: utils.Interface,
  callType?: SupportedAction
): DecodedCall => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Find the ABI function fragment for the sighash.
  const functionFragment = contractInterface.getFunction(sigHash);
  if (!functionFragment) return null;

  // Decode the function parameters.
  const params = contractInterface.decodeFunctionData(functionFragment, data);
  return {
    callType: callType || SupportedAction.GENERIC_CALL,
    function: functionFragment,
    args: params,
  };
};

const decodeCallUsingABI = (
  data: string,
  contractABI: string,
  callType?: SupportedAction
) => {
  let contractInterface = new utils.Interface(contractABI);
  return decodeCallUsingEthersInterface(data, contractInterface, callType);
};

const decodeCallUsingRegistryContract = (
  data: string,
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

  return decodeCallUsingEthersInterface(data, contractInterface);
};

const decodeCallUsingKnownSighashes = (data: string) => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Heuristic detection using known sighashes
  const match = knownSigHashes[sigHash];

  return match ? decodeCallUsingABI(data, match.ABI, match.callType) : null;
};

export const useDecodedCall = ({ to, data }: Call) => {
  const { chainId } = useWeb3React();

  let decodedCall: DecodedCall = null;

  // Detect using the Guild calls registry.
  const { contracts } = useContractRegistry();
  const matchedContract = contracts?.find(
    contract => contract.networks[chainId] === to
  );
  if (matchedContract) {
    decodedCall = decodeCallUsingRegistryContract(data, matchedContract);
  } else {
    decodedCall = decodeCallUsingKnownSighashes(data);
  }

  return {
    decodedCall,
  };
};
