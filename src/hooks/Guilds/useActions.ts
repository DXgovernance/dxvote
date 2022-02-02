import { useParams } from 'react-router-dom';
import { useEffect } from 'react-router/node_modules/@types/react';
import { BigNumber, bnum } from 'utils';
import { useProposal } from './ether-swr/useProposal';

interface useActionsReturns {
    actions: string[];
}

export const useActions = (): useActionsReturns => {
    const ZERO: BigNumber = bnum(0);

    const { guild_id: guildId, proposal_id: proposalId } = useParams<{
        chain_name: string;
        guild_id?: string;
        proposal_id?: string;
    }>();

    const { data: proposal } = useProposal(guildId, proposalId);

    let actions: string[];

    useEffect(() => {
        actions = proposal.data.map(item => {
            if (bnum(item) === ZERO) {
                return 'No';
            }
            // decode Data and extract function name
            //  or return Yes
            return 'yes';
        });
    }, [guildId, proposalId]);

    return {
        actions,
    };
};
