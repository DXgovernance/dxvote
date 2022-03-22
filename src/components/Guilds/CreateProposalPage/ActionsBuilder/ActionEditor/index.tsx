import { Call } from '..';
import { getEditor } from '../SupportedActions';
import { useDecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';

interface ActionEditorProps {
  call: Call;
  updateCall: (updatedCall: Call) => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ call, updateCall }) => {
  const { decodedCall } = useDecodedCall(call);
  const Editor = getEditor(decodedCall?.callType);
  return <Editor call={call} updateCall={updateCall} />;
};

export default ActionEditor;
