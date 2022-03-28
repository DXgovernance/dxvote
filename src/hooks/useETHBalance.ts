import { useContext } from 'contexts';
import { bnum } from 'utils';
import { BigNumber } from 'utils/bignumber';
import { useContractCalls } from './useContract';

const MulticallJSON = require('../contracts/Multicall.json');

export const useETHBalance = (fromAddress: string): BigNumber => {
  const {
    context: { configStore },
  } = useContext();

  const { data, error } = useContractCalls([
    {
      address: configStore.getNetworkContracts().utils.multicall,
      abi: MulticallJSON.abi,
      functionName: 'getEthBalance',
      params: [fromAddress],
    },
  ]);

  if (error) return bnum('0');
  else if (!data) return bnum('0');
  else return bnum(data[0]);
};
