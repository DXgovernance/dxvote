import { useState } from 'react';
import { Header as CardHeader } from '../common/Card';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import EditMode from './EditMode';
import { Option } from './types';
import { bulkEncodeCallsFromOptions } from 'hooks/Guilds/contracts/useEncodedCall';
import EditButton from './common/EditButton';

interface ActionsBuilderProps {
  options: Option[];
  editable?: boolean;
  onChange?: (options: Option[]) => void;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({
  editable,
  options,
  onChange,
}) => {
  const [isEditable, setIsEditable] = useState(editable);

  const onEdit = () => setIsEditable(true);

  const onSave = () => {
    const encodedOptions = bulkEncodeCallsFromOptions(options);
    onChange(encodedOptions);
    setIsEditable(false);
  };

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          <EditButton
            variant="secondary"
            onClick={() => (isEditable ? onSave() : onEdit())}
          >
            {isEditable ? 'Save' : 'Edit'}
          </EditButton>
        </SidebarCardHeaderSpaced>
      }
    >
      <EditMode isEditable={isEditable} options={options} onChange={onChange} />
    </SidebarCard>
  );
};
