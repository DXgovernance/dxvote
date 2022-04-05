import { DecodedAction } from '../types';
import ActionView from './ViewMode';

interface ActionEditorProps {
  action: DecodedAction;
  onChange: (updatedCall: DecodedAction) => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action }) => {
  return <ActionView isEditable={true} decodedCall={action?.decodedCall} />;
};

export default ActionEditor;
