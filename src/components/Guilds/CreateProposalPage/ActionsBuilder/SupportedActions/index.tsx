import { DecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';
import { RequireAtLeastOne } from 'utils/types';
import { Call } from '..';
import ERC20TransferInfoLine from './ERC20Transfer/ERC20TransferInfoLine';
import ERC20TransferSummary from './ERC20Transfer/ERC20TransferSummary';

export interface ActionViewProps {
  call: Call;
  decodedCall: DecodedCall;
}

export enum SupportedAction {
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  GENERIC_CALL = 'GENERIC_CALL',
}

type SupportedActionViews = {
  infoLineView: React.FC<ActionViewProps>;
  summaryView?: React.FC<ActionViewProps>;
};

type SupportedActionEditors = RequireAtLeastOne<{
  bulkEditor?: React.FC<ActionViewProps>;
  editor?: React.FC<ActionViewProps>;
}>;

export const supportedActions: Record<
  SupportedAction,
  SupportedActionViews & SupportedActionEditors
> = {
  [SupportedAction.ERC20_TRANSFER]: {
    infoLineView: ERC20TransferInfoLine,
    summaryView: ERC20TransferSummary,
    editor: () => <div>ERC20 Editor</div>,
  },
  [SupportedAction.GENERIC_CALL]: {
    infoLineView: () => <div>Generic Call</div>,
    editor: () => <div>Generic Call Editor</div>,
  },
};

export const getInfoLineView = (actionType: SupportedAction) => {
  if (actionType == null) return null;

  return supportedActions[actionType].infoLineView;
};

export const getSummaryView = (actionType: SupportedAction) => {
  if (actionType == null) return null;

  return supportedActions[actionType].summaryView;
};
