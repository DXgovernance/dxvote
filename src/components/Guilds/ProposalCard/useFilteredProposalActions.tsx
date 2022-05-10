import { useMemo } from 'react';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';
import { DecodedAction } from 'components/Guilds/ActionsBuilder/types';

import { SupportedAction } from 'components/Guilds/ActionsBuilder/types';
//@ts-ignore
const isApprovalCall = (action: DecodedAction) => {
  // TODO: improve this with better conditions. At read point decodedAction has no other stuff that I could use.
  const type = action?.decodedCall?.callType;
  return (
    type === SupportedAction.GENERIC_CALL &&
    Object.keys(action?.contract?.events ?? {}).some(key =>
      key.includes('Approval')
    )
  );
};

/**
 * 1. rep minting
 * 2. spending calls
 * 3. transfers.
 * 4. generic calls
 */
export interface PointedDecodedAction extends DecodedAction {
  points: number;
}
const getActionPoints = (action: DecodedAction): number => {
  const type = action?.decodedCall?.callType;
  if (type === SupportedAction.REP_MINT) return 1;
  if (isApprovalCall(action)) return 2;
  if (type === SupportedAction.ERC20_TRANSFER) return 3;
  if (type === SupportedAction.GENERIC_CALL) return 4;
  return 5;
};

const useFilteredProposalActions = (
  guildId: string,
  proposalId: string,
  maxActions: number
): PointedDecodedAction[] => {
  // @ts-ignore
  // const li = (...args) => {
  //   if (
  //     proposalId ===
  //     '0x50683f81a98dca8b4d2d1445c94eb15ed137ea32a9c0f671f7e4580970fe98eb'
  //   )
  //     console.log(...args);
  // };
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

    // get list of actions
    const onlyActions = sortedOptionsByWiningVote?.reduce((acc, option) => {
      return [...acc, ...option.decodedActions];
    }, []);

    const pointedActions = onlyActions?.reduce((acc, action, idx, actions) => {
      const points = action?.points || getActionPoints(action);
      if (isApprovalCall(action) && !!actions[idx + 1]) {
        // if current action is spending call and nextaction exist we asume that next action is the one that require approval.
        actions[idx + 1].points = points; // give approval points to next action to order
        actions[idx + 1].approval = {
          amount: action?.decodedCall.args._value,
          token: action?.decodedCall.to,
        };
        return acc; // skip current actual approval action.
      }
      return [...acc, { ...action, points }];
    }, []);

    // sort by points
    const sortedActions = pointedActions?.sort((a, b) => a.points - b.points);

    // li('sortedActions', sortedActions);

    return sortedActions?.slice(0, maxActions);
  }, [options, maxActions]);
};

export default useFilteredProposalActions;
