import { BigNumber } from 'ethers';
import { utils } from 'ethers';

export enum SupportedAction {
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  GENERIC_CALL = 'GENERIC_CALL',
}

export interface Call {
  from: string;
  to: string;
  data: string;
  value: BigNumber;
}

export interface DecodedCall {
  callType: SupportedAction;
  from: string;
  to: string;
  value: BigNumber;
  function: utils.FunctionFragment;
  args: Record<string, any>;
}

export interface DecodedAction {
  decodedCall: DecodedCall;
  contract: utils.Interface;
}

export interface Option {
  index: number;
  label: string;
  actions?: Call[];
  decodedActions?: DecodedAction[];
}
