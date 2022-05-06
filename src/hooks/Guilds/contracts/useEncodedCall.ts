import { utils } from 'ethers';
import {
  Call,
  DecodedCall,
  Option,
} from 'old-components/Guilds/ActionsBuilder/types';

export const encodeCall = (
  decodedCall: DecodedCall,
  contractInterface: utils.Interface
) => {
  const args = contractInterface
    .getFunction(decodedCall.function.name)
    .inputs.map(input => decodedCall.args[input.name]);
  return contractInterface.encodeFunctionData(decodedCall.function, args);
};

export const bulkEncodeCallsFromOptions = (options: Option[]): Option[] => {
  return options.map(option => {
    const { decodedActions } = option;
    const encodedCalls: Call[] = decodedActions?.map(decodedAction => ({
      from: decodedAction.decodedCall.from,
      to: decodedAction.decodedCall.to,
      data: encodeCall(decodedAction.decodedCall, decodedAction.contract),
      value: decodedAction.decodedCall.value,
    }));
    return {
      ...option,
      actions: encodedCalls,
    };
  });
};

export const useEncodedCall = (
  decodedCall: DecodedCall,
  contractInterface: utils.Interface
) => {
  return encodeCall(decodedCall, contractInterface);
};
