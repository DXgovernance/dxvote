import { useContext } from 'contexts';
import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { useContractCall } from './useContract';

const MulticallJSON = require('../contracts/Multicall.json');

export const useETHBalance = (fromAddress: string): BigNumber => {
  const {
    context: { configStore },
  } = useContext();

  const balance = useContractCall(
    configStore.getNetworkContracts().utils.multicall,
    MulticallJSON.abi,
    'getEthBalance',
    fromAddress
  );

  return balance ? bnum(balance) : bnum('0');
};
