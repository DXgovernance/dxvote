import { useMemo } from 'react';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';
import { DecodedAction } from 'old-components/Guilds/ActionsBuilder/types';
import { getActionPoints } from 'old-components/Guilds/ActionsBuilder/SupportedActions';

export interface PointedDecodedAction extends DecodedAction {
  points: number;
}
/**
 * @description  Returns a list of proposal actions ordered by importance.
 * @param guildId Guild id
 * @param proposalId Proposal id
 * @param maxActions Maximum number of actions to return
 **/

export const useProposalSummaryActions = (
  guildId: string,
  proposalId: string,
  maxActions?: number
): PointedDecodedAction[] => {
  const { options } = useProposalCalls(guildId, proposalId);

  return useMemo(() => {
    // Sort Options by vote count.
    const sortedOptionsByWiningVote = options?.sort((a, b) => {
      const aVotes = a.totalVotes?.toBigInt();
      const bVotes = b.totalVotes?.toBigInt();
      if (aVotes === bVotes) return 0;
      if (aVotes < bVotes) return 1;
      return -1;
    });

    // Get list of actions from ordered options
    const onlyActions: DecodedAction[] = sortedOptionsByWiningVote?.reduce(
      (acc, option) => {
        return [...acc, ...option.decodedActions];
      },
      []
    );

    // Add relevance points to each action;
    const pointedActions: PointedDecodedAction[] = onlyActions?.reduce(
      (acc, action) => {
        const points = getActionPoints(action);
        return [...acc, { ...action, points }];
      },
      []
    );

    // sort by points
    const sortedActions = pointedActions?.sort((a, b) => b.points - a.points);

    return sortedActions?.slice(0, maxActions || sortedActions.length);
  }, [options, maxActions]);
};
