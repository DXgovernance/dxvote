import { useParams } from 'react-router-dom';
import { useProposal } from './ether-swr/useProposal';
import { useMemo } from 'react';

interface useActionsReturns {
  actions: string[];
  possibleActions: number[];
}

export const useActions = (): useActionsReturns => {
  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    chain_name: string;
    guild_id?: string;
    proposal_id?: string;
  }>();

  const { data: proposal } = useProposal(guildId, proposalId);

  // each action has no calls --> lots of calls
  // the smart contract limits the contract calls that action can make to those
  // recorded on the permission registry contract
  // just decode each call according to those in the function signatures in the recorded array
  // @TODO reset active proposals limit and create new proposals
  const possibleActions = useMemo(() => {
    return [...Array(proposal.totalActions.toNumber()).keys()];
  }, [proposal]);

  const actions = useMemo(() => {
    return proposal.data.map((item, i) => {
      if (i == 0) {
        return 'No';
      }
      console.log(item);
      //@TODO decode action call data and extract function name, e.g. yes APPROVE/TRANSFER
      return 'yes';
    });
  }, [guildId, proposalId]);

  return {
    actions,
    possibleActions,
  };
};
