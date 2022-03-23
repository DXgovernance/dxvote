import { BigNumber, utils } from 'ethers';
import { DeepPartial, RequireAtLeastOne } from 'utils/types';
import { Call, DecodedAction, DecodedCall, SupportedAction } from '../types';
import ERC20ABI from '../../../../abis/ERC20.json';
import ERC20TransferEditor from './ERC20Transfer/ERC20TransferEditor';
import ERC20TransferInfoLine from './ERC20Transfer/ERC20TransferInfoLine';
import ERC20TransferSummary from './ERC20Transfer/ERC20TransferSummary';

export interface ActionViewProps {
  call: Call;
  decodedCall: DecodedCall;
}

export interface ActionEditorProps {
  contract: utils.Interface;
  call: DecodedCall;
  updateCall: (updatedCall: DecodedCall) => void;
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

let ERC20Contract = new utils.Interface(ERC20ABI);

export const defaultValues: Record<
  SupportedAction,
  DeepPartial<DecodedAction>
> = {
  [SupportedAction.ERC20_TRANSFER]: {
    contract: ERC20Contract,
    decodedCall: {
      function: ERC20Contract.getFunction('transfer'),
      to: '',
      value: BigNumber.from(0),
      args: {
        _to: '',
        _value: BigNumber.from(0),
      },
    },
  },
  [SupportedAction.GENERIC_CALL]: {},
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
