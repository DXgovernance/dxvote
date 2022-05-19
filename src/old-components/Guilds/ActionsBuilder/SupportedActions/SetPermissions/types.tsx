import { BigNumber } from 'ethers';

export interface ParsedDataInterface {
  asset: string[];
  to: string[];
  functionSignature: string[];
  valueAllowed: BigNumber[];
  allowance: boolean[];
  functionName: string;
}

export interface ValidationsInterface {
  asset: boolean;
  to: boolean;
  valueAllowed: boolean;
  functionName: boolean;
}
