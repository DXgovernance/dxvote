import { useEffect, useState } from "react"
import useContract from '../contracts/useContract';


export interface useProposalsReturns {
    proposals: Proposal[]

}

//
// @TODO use typechain interfaces for state
// @TODO get contract addresses using
//

export const useProposals = (contractAddress: String): useProposalsReturns => {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [proposalIds, setProposalIds] = useState()


    const contract = useContract()

    useEffect(() => {
        setProposals([])

    }, [])

    useEffect(() => {
        setProposalIds()

    }, [])

    return {
        proposals

    }
}
