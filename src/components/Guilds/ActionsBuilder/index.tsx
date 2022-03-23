import styled from 'styled-components';
import { useState } from 'react';
import { Header as CardHeader } from '../common/Card';
import { Button as CommonButton } from '../common/Button';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import EditMode from './EditMode';
import ViewMode from './ViewMode';
import { Option } from './types';
import { bulkEncodeCallsFromOptions } from 'hooks/Guilds/contracts/useEncodedCall';
import { useParams } from 'react-router-dom';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';

const Button = styled(CommonButton)`
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-size: ${({ theme }) => theme.fontSizes.label};
  margin: 0;
  padding: 0.25rem 0.75rem;
`;

interface ActionsBuilderProps {
  editable?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({ editable }) => {
  const [actionsEditMode, setActionsEditMode] = useState(editable);

  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    proposal_id?: string;
    guild_id?: string;
  }>();
  const { options: existingOptions } = useProposalCalls(guildId, proposalId);

  const [updatedOptions, setUpdatedOptions] = useState<Option[]>(null);

  const onEdit = () => setActionsEditMode(true);

  const onSave = () => {
    const encodedOptions = bulkEncodeCallsFromOptions(updatedOptions);
    setUpdatedOptions(encodedOptions);
    setActionsEditMode(false);
  };

  const options = existingOptions || updatedOptions;

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          {editable && (
            <Button
              variant="secondary"
              onClick={() => (actionsEditMode ? onSave() : onEdit())}
            >
              {actionsEditMode ? 'Save' : 'Edit'}
            </Button>
          )}
        </SidebarCardHeaderSpaced>
      }
    >
      {actionsEditMode ? (
        <EditMode options={options} onChange={setUpdatedOptions} />
      ) : (
        <ViewMode options={options} />
      )}
    </SidebarCard>
  );
};
