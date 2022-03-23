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
  function: utils.FunctionFragment;
  args: utils.Result;
}

export interface Option {
  index: number;
  label: string;
  actions?: Call[];
  decodedActions?: DecodedCall[];
}
