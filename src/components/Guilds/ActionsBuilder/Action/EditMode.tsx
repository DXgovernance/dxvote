import { getEditor } from '../SupportedActions';
import { DecodedAction, DecodedCall } from '../types';

interface ActionEditorProps {
  action: DecodedAction;
  onChange: (updatedCall: DecodedAction) => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action, onChange }) => {
  const Editor = getEditor(action?.decodedCall?.callType);

  const updateCall = (updatedCall: DecodedCall) => {
    onChange({ ...action, decodedCall: updatedCall });
  };

  return (
    <Editor
      contract={action.contract}
      call={action.decodedCall}
      updateCall={updateCall}
    />
  );
};

export default ActionEditor;
