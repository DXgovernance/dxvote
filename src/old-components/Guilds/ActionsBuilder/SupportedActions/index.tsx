import { BigNumber, utils } from 'ethers';
import { DeepPartial } from 'utils/types';
import {
  DecodedAction,
  DecodedCall,
  SupportedAction,
  ApproveSendTokens,
} from '../types';
import ERC20ABI from '../../../../abis/ERC20.json';
import ERC20SnapshotRep from '../../../../contracts/ERC20SnapshotRep.json';
import ERC20TransferEditor from './ERC20Transfer/ERC20TransferEditor';
import ERC20TransferInfoLine from './ERC20Transfer/ERC20TransferInfoLine';
import ERC20TransferSummary from './ERC20Transfer/ERC20TransferSummary';
import GenericCallInfoLine from './GenericCall/GenericCallInfoLine';
import RepMintEditor from './RepMint/RepMintEditor';
import RepMintInfoLine from './RepMint/RepMintInfoLine';
import RepMintSummary from './RepMint/RepMintSummary';

export interface SupportedActionMetadata {
  title: string;
}
export interface ActionViewProps {
  decodedCall: DecodedCall;
  approveSpendTokens?: ApproveSendTokens;
  compact?: boolean;
}

export interface ActionEditorProps extends ActionViewProps {
  updateCall: (updatedCall: DecodedCall) => void;
}

type SupportedActionViews = {
  infoLineView: React.FC<ActionViewProps>;
  summaryView?: React.FC<ActionViewProps>;
};

type SupportedActionEditors = {
  editor: React.FC<ActionEditorProps>;
};

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
    infoLineView: RepMintInfoLine,
    summaryView: RepMintSummary,
    editor: RepMintEditor,
  },
  [SupportedAction.GENERIC_CALL]: {
    title: 'Generic Call',
    infoLineView: GenericCallInfoLine,
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

const isApprovalCall = (action: DecodedAction) => {
  return !!action?.approval;
};

/**
 * Importance:
 * 1. rep minting
 * 2. spending calls
 * 3. transfers.
 * 4. generic calls
 */
export const getActionPoints = (action: DecodedAction): number => {
  const type = action?.decodedCall?.callType;
  if (type === SupportedAction.REP_MINT) return 5;
  if (isApprovalCall(action)) return 4;
  if (type === SupportedAction.ERC20_TRANSFER) return 3;
  if (type === SupportedAction.GENERIC_CALL) return 2;
  return 1;
};
