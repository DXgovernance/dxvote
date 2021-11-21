import { useContext } from "contexts"
import { useState , useEffect} from "react"
import { BigNumber } from "utils/bignumber"
import { ZERO_ADDRESS } from "utils/constants"
import { bnum } from "utils/helpers"


interface UseRepReturns {
  totalSupply: BigNumber
  userRep: BigNumber
}


interface MemoInteface {
  [index: number]: {
    totalSupply: BigNumber,
    userRep: BigNumber
  }
 }


export const useRep = (userAddress: string = ZERO_ADDRESS, atBlock: number = 0): UseRepReturns => {
  const {context: {daoStore,  configStore }} = useContext()
  const [totalSupply, setTotalSupply] = useState<BigNumber>(bnum(0))
  const [userRep, setUserRep] = useState<BigNumber>(bnum(0))
  const [memo, setMemo] = useState<MemoInteface>({})


  const repEvents = daoStore.getCache().daoInfo.repEvents;
  const inL2 = configStore.getActiveChainName().indexOf('arbitrum') > -1;

    // go through entire array once, store value in object,
    // {[blockNumber]: {totalSupply: "2132"}
    // cache value
    // localStorage/SessionStorage
    // go through object

  const cache: MemoInteface = {}

  const getTotalSupply = repEvents.reduce((total, repEvent) => {
      if (repEvent.event === 'Mint') {
        total.plus(repEvent.amount)
        cache[inL2 ? repEvent.l2BlockNumber : repEvent.l1BlockNumber].totalSupply == total
      }

      if (repEvent.event === 'burn') {
        total.minus(repEvent.amount)
        cache[inL2 ? repEvent.l2BlockNumber : repEvent.l1BlockNumber].totalSupply == total
      }
    return total
    }, bnum(0))

  const getUserRep = repEvents.reduce((total, repEvent) => {
  if(repEvent.event === 'Mint' && repEvent.account === userAddress){
    total.plus(repEvent.amount)
    cache[inL2 ? repEvent.l2BlockNumber : repEvent.l1BlockNumber].userRep == total
  }
  if(repEvent.event === 'burn' && repEvent.account === userAddress){
    total.minus(repEvent.amount)
    cache[inL2 ? repEvent.l2BlockNumber : repEvent.l1BlockNumber].userRep == total
  }
  return total
}, bnum(0))

  useEffect(() => {
    getTotalSupply
    getUserRep
    setMemo(cache)
  }, [repEvents])

useEffect(() => {
  setTotalSupply(memo[atBlock].totalSupply)
  setUserRep(memo[atBlock].userRep)
}, [userAddress, atBlock])



  return {
    totalSupply,
    userRep
  }
}
