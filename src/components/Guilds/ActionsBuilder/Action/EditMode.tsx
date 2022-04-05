// import { getEditor } from '../SupportedActions';
// import { DecodedAction, DecodedCall } from '../types';

import { DecodedAction } from '../types';
import ActionView from './ViewMode';

interface ActionEditorProps {
  action: DecodedAction;
  onChange: (updatedCall: DecodedAction) => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action }) => {
  // const Editor = getEditor(action?.decodedCall?.callType);

  // const updateCall = (updatedCall: DecodedCall) => {
  //   onChange({ ...action, decodedCall: updatedCall });
  // };

  return <ActionView isEditable={true} decodedCall={action?.decodedCall} />;

  // return (
  //   <Editor
  //     contract={action.contract}
  //     call={action.decodedCall}
  //     updateCall={updateCall}
  //   />
  // );
};

export default ActionEditor;
