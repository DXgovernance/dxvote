import { useMemo } from 'react';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';
import {
  DecodedAction,
  SupportedAction,
} from 'old-components/Guilds/ActionsBuilder/types';

const isApprovalCall = (action: DecodedAction) => {
  // TODO: improve this with better conditions. At read point decodedAction has no other things to validate than generic call && approval event in contract interface
  const type = action?.decodedCall?.callType;
  return (
    type === SupportedAction.GENERIC_CALL &&
    Object.keys(action?.contract?.events ?? {}).some(key =>
      key.includes('Approval')
    )
  );
};

/**
 * Importance:
 * 1. rep minting
 * 2. spending calls
 * 3. transfers.
 * 4. generic calls
 */
const getActionPoints = (action: DecodedAction): number => {
  const type = action?.decodedCall?.callType;
  if (type === SupportedAction.REP_MINT) return 5;
  if (isApprovalCall(action)) return 4;
  if (type === SupportedAction.ERC20_TRANSFER) return 3;
  if (type === SupportedAction.GENERIC_CALL) return 2;
  return 1;
};

export interface PointedDecodedAction extends DecodedAction {
  points: number;
}
/**
 * @description  Returns a list of proposal actions ordered by importance.
 * @param guildId Guild id
 * @param proposalId Proposal id
 * @param maxActions Maximum number of actions to return
 **/

const useFilteredProposalActions = (
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
    const onlyActions = sortedOptionsByWiningVote?.reduce((acc, option) => {
      return [...acc, ...option.decodedActions];
    }, []);

    // Add relevance points to each action;
    const pointedActions = onlyActions?.reduce((acc, action, idx, actions) => {
      const points = action?.points || getActionPoints(action);
      if (isApprovalCall(action) && !!actions[idx + 1]) {
        // if current action is spending call and nextaction exist we asume that next action is the one that require current approval.
        actions[idx + 1].points = points; // give approval points to next action to order next
        actions[idx + 1].approval = {
          amount: action?.decodedCall.args._value,
          token: action?.decodedCall.to,
        };
        return acc; // prevent showing the actual approval action.
      }
      return [...acc, { ...action, points }];
    }, []);

    // sort by points
    const sortedActions = pointedActions?.sort((a, b) => b.points - a.points);

    return sortedActions?.slice(0, maxActions || sortedActions.length);
  }, [options, maxActions]);
};

export default useFilteredProposalActions;
