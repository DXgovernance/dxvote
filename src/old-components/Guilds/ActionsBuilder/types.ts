import { BigNumber } from 'ethers';
import { utils } from 'ethers';
import { RichContractData } from 'hooks/Guilds/contracts/useRichContractRegistry';

export enum SupportedAction {
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  REP_MINT = 'REP_MINT',
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
  richData?: RichContractData;
}

export interface DecodedAction {
  id: string;
  decodedCall: DecodedCall;
  contract: utils.Interface;
  approval?: ApproveSendTokens;
}

export interface Option {
  id: string;
  label: string;
  color: string;
  actions?: Call[];
  decodedActions?: DecodedAction[];
}

export interface ApproveSendTokens {
  amount: BigNumber;
  token: string;
}
