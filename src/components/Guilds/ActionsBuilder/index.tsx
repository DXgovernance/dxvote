import { useState } from 'react';
import { Header as CardHeader } from '../common/Card';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import EditMode from './EditMode';
import ViewMode from './ViewMode';
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
  const [actionsEditMode, setActionsEditMode] = useState(editable);

  const onEdit = () => setActionsEditMode(true);

  const onSave = () => {
    const encodedOptions = bulkEncodeCallsFromOptions(options);
    onChange(encodedOptions);
    setActionsEditMode(false);
  };

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          {editable && (
            <EditButton
              variant="secondary"
              onClick={() => (actionsEditMode ? onSave() : onEdit())}
            >
              {actionsEditMode ? 'Save' : 'Edit'}
            </EditButton>
          )}
        </SidebarCardHeaderSpaced>
      }
    >
      {actionsEditMode ? (
        <EditMode options={options} onChange={onChange} />
      ) : (
        <ViewMode options={options} />
      )}
    </SidebarCard>
  );
};
