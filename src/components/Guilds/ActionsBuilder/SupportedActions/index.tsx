import { BigNumber, utils } from 'ethers';
import { DeepPartial, RequireAtLeastOne } from 'utils/types';
import { DecodedAction, DecodedCall, SupportedAction } from '../types';
import ERC20ABI from '../../../../abis/ERC20.json';
import ERC20SnapshotRep from '../../../../contracts/ERC20SnapshotRep.json';
import ERC20TransferEditor from './ERC20Transfer/ERC20TransferEditor';
import ERC20TransferInfoLine from './ERC20Transfer/ERC20TransferInfoLine';
import ERC20TransferSummary from './ERC20Transfer/ERC20TransferSummary';
import REPMintEditor from './REPMint/REPMintEditor';
import REPMintInfoLine from './REPMint/REPMintInfoLine';
import REPMintSummary from './REPMint/REPMintSummary';
export interface SupportedActionMetadata {
  title: string;
}
export interface ActionViewProps {
  decodedCall: DecodedCall;
}

export interface ActionEditorProps {
  decodedCall: DecodedCall;
  updateCall: (updatedCall: DecodedCall) => void;
}

type SupportedActionViews = {
  infoLineView: React.FC<ActionViewProps>;
  summaryView?: React.FC<ActionViewProps>;
};

type SupportedActionEditors = RequireAtLeastOne<{
  editor?: React.FC<ActionEditorProps>;
}>;

export const supportedActions: Record<
  SupportedAction,
  SupportedActionViews & SupportedActionEditors & SupportedActionMetadata
> = {
  [SupportedAction.ERC20_TRANSFER]: {
    title: 'Transfers & Mint',
    infoLineView: ERC20TransferInfoLine,
    summaryView: ERC20TransferSummary,
    editor: ERC20TransferEditor,
  },
  [SupportedAction.REP_MINT]: {
    title: 'Mint Reputation',
    infoLineView: REPMintInfoLine,
    summaryView: REPMintSummary,
    editor: REPMintEditor,
  },
  [SupportedAction.GENERIC_CALL]: {
    title: 'Generic Call',
    infoLineView: () => <div>Generic Call</div>,
    editor: () => <div>Generic Call Editor</div>,
  },
};
const ERC20Contract = new utils.Interface(ERC20ABI);
const ERC20SnapshotRepContract = new utils.Interface(ERC20SnapshotRep.abi);
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
  [SupportedAction.REP_MINT]: {
    contract: ERC20SnapshotRepContract,
    decodedCall: {
      function: ERC20SnapshotRepContract.getFunction('mint'),
      to: '',
      value: BigNumber.from(0),
      args: {
        to: '',
        amount: BigNumber.from(0),
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
