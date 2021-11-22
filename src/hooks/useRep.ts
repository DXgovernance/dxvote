import { useContext } from 'contexts';
import { useState, useEffect } from 'react';
import { bnum } from 'utils';
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
    context: { daoStore, configStore , providerStore},
  } = useContext();
  const [memo, setMemo] = useState<MemoInteface>({});
  const repEvents = daoStore.getCache().daoInfo.repEvents;
  const inL2 = configStore.getActiveChainName().indexOf('arbitrum') > -1;

  let totalSupply: BigNumber = bnum(0)
  let userRep: BigNumber = bnum(0)



  const getRep = (atBlock: number = 0) => {
    const values = memo
    if (atBlock === 0) atBlock = providerStore.getCurrentBlockNumber();
    const closest = Object.keys(values).reduce((a,b) => parseInt(b) > atBlock ? a : b)
    const totalSupply = values[closest]["totalSupply"];
    const userRep = values[closest]["userRep"];

    return { totalSupply, userRep };
  };

  useEffect(() => {
  for (let i = 0; i < repEvents.length; i++) {
    if (repEvents[i].event === 'Mint') {
      totalSupply = totalSupply.plus(repEvents[i].amount);
      memo[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber] =  {
        "totalSupply": totalSupply,
        "userRep" : bnum(0)
      }
      if (repEvents[i].account === userAddress)
        userRep = userRep.plus(repEvents[i].amount);
      memo[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber] = {
        "totalSupply": totalSupply,
        "userRep": userRep
      }
      memo[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber]["userRep"] = userRep;
    } else if (repEvents[i].event === 'Burn') {
      totalSupply = totalSupply.minus(repEvents[i].amount);
      memo[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber] = {
        "totalSupply": totalSupply,
        "userRep": bnum(0)
      }
      if (repEvents[i].account === userAddress)
        userRep = userRep.minus(repEvents[i].amount);
      memo[inL2 ? repEvents[i].l2BlockNumber : repEvents[i].l1BlockNumber] = {
        "totalSupply": totalSupply,
        "userRep": userRep
      }
    }
  }
    setMemo(memo);
  }, [repEvents]);

  return {
    getRep,
  };
};
