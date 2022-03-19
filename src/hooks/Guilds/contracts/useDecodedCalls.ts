import { BigNumber, utils } from 'ethers';
import { RegistryContract, useContractRegistry } from './useContractRegistry';
import ERC20ABI from '../../../abis/ERC20.json';
import { useWeb3React } from '@web3-react/core';

interface useDecodedCallsProps {
  from: string;
  to: string;
  data: string;
  value: BigNumber;
  contractABI: string;
}

const ERC20_TRANSFER_SIGNATURE = '0xa9059cbb';
const ERC20_APPROVE_SIGNATURE = '0x095ea7b3';

const knownSigHashesToABIs = {
  [ERC20_TRANSFER_SIGNATURE]: ERC20ABI,
  [ERC20_APPROVE_SIGNATURE]: ERC20ABI,
};

const decodeCalls = (data: string, contractInterface: utils.Interface) => {
  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  // Find the ABI function fragment for the sighash.
  const functionFragment = contractInterface.getFunction(sigHash);
  if (!functionFragment) return null;

  // Get the parameter types for the function.
  const paramTypes = functionFragment.inputs;

  // Decode the function parameters.
  const result = utils.defaultAbiCoder.decode(paramTypes, data.slice(10));
  return {
    function: functionFragment,
    args: result,
  };
};

const decodeCallUsingABI = (data: string, contractABI: string) => {
  let contractInterface = new utils.Interface(contractABI);
  return decodeCalls(data, contractInterface);
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

  return decodeCalls(data, contractInterface);
};

export const useDecodedCalls = ({
  from,
  to,
  data,
  value,
}: useDecodedCallsProps) => {
  const { chainId } = useWeb3React();

  // Get the first 10 characters of Tx data, which is the Function Selector (SigHash).
  const sigHash = data.substring(0, 10);

  let decodedCalls = null;

  // Detect using the Guild calls registry.
  const { contracts } = useContractRegistry();
  const matchedContract = contracts.find(
    contract => contract.networks[chainId] === to
  );
  if (matchedContract) {
    decodedCalls = decodeCallUsingRegistryContract(data, matchedContract);
  } else {
    // Heuristic detection using known sighashes
    const matchedABI = knownSigHashesToABIs[sigHash];
    if (matchedABI) {
      return decodeCallUsingABI(data, matchedABI);
    }
  }

  return {
    from,
    to,
    data,
    value,
    decodedCalls,
  };
};
