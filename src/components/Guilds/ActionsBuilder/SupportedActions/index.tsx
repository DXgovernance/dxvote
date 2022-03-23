import { RequireAtLeastOne } from 'utils/types';
import { Call, DecodedCall, SupportedAction } from '../types';
import ERC20TransferEditor from './ERC20Transfer/ERC20TransferEditor';
import ERC20TransferInfoLine from './ERC20Transfer/ERC20TransferInfoLine';
import ERC20TransferSummary from './ERC20Transfer/ERC20TransferSummary';

export interface ActionViewProps {
  call: Call;
  decodedCall: DecodedCall;
}

export interface ActionEditorProps {
  call: Call;
  updateCall: (updatedCall: Call) => void;
}

type SupportedActionViews = {
  infoLineView: React.FC<ActionViewProps>;
  summaryView?: React.FC<ActionViewProps>;
};

type SupportedActionEditors = RequireAtLeastOne<{
  bulkEditor?: React.FC<ActionEditorProps>;
  editor?: React.FC<ActionEditorProps>;
}>;

export const supportedActions: Record<
  SupportedAction,
  SupportedActionViews & SupportedActionEditors
> = {
  [SupportedAction.ERC20_TRANSFER]: {
    infoLineView: ERC20TransferInfoLine,
    summaryView: ERC20TransferSummary,
    editor: ERC20TransferEditor,
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

export const getEditor = (actionType: SupportedAction) => {
  if (actionType == null) return null;

  return supportedActions[actionType].editor;
};
