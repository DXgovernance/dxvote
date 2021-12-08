import { Signer } from 'ethers';
import { Provider } from 'ethers/providers';
import { BigNumber } from 'ethers/utils';
import { useEffect, useState } from 'react';
import { ERC20Guild__factory } from '../../types/factories/ERC20Guild__factory';

export interface useProposalsReturns {
    proposals: GuildsProposal[];
}

export interface useProposalParams {
    contractAddress: string,
    signerOrProvider: Signer | Provider
}

export interface GuildsProposal {
    creator: string;
    startTime: BigNumber;
    endTime: BigNumber;
    to: string[];
    data: string[];
    value: BigNumber[];
    totalActions: BigNumber;
    title: string;
    contentHash: string;
    state: number;
    totalVotes: BigNumber[];
}

export const useProposals = ({ contractAddress, signerOrProvider }: useProposalParams): useProposalsReturns => {
    const [proposals, setProposals] = useState<GuildsProposal[]>([]);
    const [proposalIds, setProposalIds] = useState<string[]>([]);

    const ERC20_GUILD_INSTANCE = ERC20Guild__factory.connect(
        contractAddress,
        signerOrProvider
    );


    useEffect(() => {
        const getProposals = async () => {
            const proposals = await Promise.all(proposalIds.map(id => ERC20_GUILD_INSTANCE.getProposal(id)))
            return setProposals(proposals);
        }

        getProposals()

    }, [contractAddress, signerOrProvider]);

    useEffect(() => {
        const getProposalIds = async () => {
            const ids = await ERC20_GUILD_INSTANCE.getProposalsIds();
            return setProposalIds(ids);
        };

        getProposalIds();


    }, [contractAddress, signerOrProvider]);

    return {
        proposals,
    };
};
