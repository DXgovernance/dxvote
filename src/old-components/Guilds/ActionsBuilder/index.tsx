import { Header as CardHeader } from '../common/Card';
import OptionsList from './OptionsList';
import EditButton from './common/EditButton';
import { Option } from './types';
import { bulkEncodeCallsFromOptions } from 'hooks/Guilds/contracts/useEncodedCall';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'old-components/Guilds/SidebarCard';
import { useState } from 'react';

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
          {editable && (
            <EditButton
              variant="secondary"
              onClick={() => (isEditable ? onSave() : onEdit())}
            >
              {isEditable ? 'Save' : 'Edit'}
            </EditButton>
          )}
        </SidebarCardHeaderSpaced>
      }
    >
      <OptionsList
        isEditable={isEditable}
        options={options}
        onChange={onChange}
      />
    </SidebarCard>
  );
};
