import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import { BigNumber } from 'utils/bignumber';
import { ZERO_ADDRESS } from 'utils/constants';

interface UseRepReturns {
  getRep(atBlock: number): { totalSupply: BigNumber; userRep: BigNumber };
}

interface MemoInteface {
  [index: number]: {
    totalSupply: BigNumber;
    userRep: BigNumber;
  };
}

export const useRep = (userAddress: string = ZERO_ADDRESS): UseRepReturns => {
  const {
    context: { daoStore, configStore },
  } = useContext();
  const [memo, setMemo] = useState<MemoInteface>({});
  const cache: MemoInteface = {};
  const repEvents = daoStore.getCache().daoInfo.repEvents;
  const inL2 = configStore.getActiveChainName().indexOf('arbitrum') > -1;

  let totalSupply: BigNumber;
  let userRep: BigNumber;

  const getRep = (atBlock: number = 0) => {
    const totalSupply = memo[atBlock].totalSupply;
    const userRep = memo[atBlock].userRep;

    return { totalSupply, userRep };
  };

  for (let i = 0; i < repEvents.length; i++) {
    if (repEvents[i].event === 'Mint') {
      totalSupply = totalSupply.plus(repEvents[i].amount);
      cache[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber]
        .totalSupply == totalSupply;
      if (repEvents[i].account === userAddress)
        userRep = userRep.plus(repEvents[i].amount);
      cache[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber]
        .userRep == userRep;
    } else if (repEvents[i].event === 'Burn') {
      totalSupply = totalSupply.minus(repEvents[i].amount);
      cache[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber]
        .totalSupply == totalSupply;
      if (repEvents[i].account === userAddress)
        userRep = userRep.minus(repEvents[i].amount);
      cache[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber]
        .userRep == userRep;
    }
  }

  useEffect(() => {
    setMemo(cache);
  }, [repEvents]);

  return {
    getRep,
  };
};
