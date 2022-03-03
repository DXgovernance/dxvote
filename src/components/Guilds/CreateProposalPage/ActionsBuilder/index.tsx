import styled from 'styled-components';
import { useState } from 'react';
import { Header as CardHeader } from '../../common/Card';
import { Divider } from '../../common/Divider';
import { Button as CommonButton } from '../../common/Button';
import { Box } from '../../common/Layout';
import SidebarCard, {
  SidebarCardHeaderSpaced,
} from 'components/Guilds/SidebarCard';
import OptionRow, { Option } from './Option';
import AddButton from './AddButton';

const Button = styled(CommonButton)`
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
  padding: 4px 8px;
`;

interface ActionsBuilderProps {
  editable?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({ editable }) => {
  const [actionsEditMode, setActionsEditMode] = useState(true);

  // TODO: remove when actions are implemented
  const [options, setOptions] = useState<Option[]>([
    {
      index: 0,
      label: 'For',
    },
    {
      index: 1,
      label: 'Against',
    },
  ]);

  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          {editable &&
            (actionsEditMode ? (
              <Button
                variant="secondary"
                onClick={() => setActionsEditMode(false)}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setActionsEditMode(true)}
              >
                Edit
              </Button>
            ))}
        </SidebarCardHeaderSpaced>
      }
    >
      {options.map((option, idx) => (
        <>
          <OptionRow
            key={idx}
            data={option}
            editable={editable && actionsEditMode}
          />
          {idx !== options.length - 1 && <Divider />}
        </>
      ))}

      {editable && actionsEditMode && (
        <>
          <Divider />
          <Box padding="16px">
            <AddButton
              label="Add Option"
              onClick={() => {
                // TODO: remove this random functionality when building "add option" funcionality
                setOptions(prev => [
                  ...prev,
                  {
                    index: prev.length + 1,
                    label: 'Option ' + (prev.length + 1),
                  },
                ]);
              }}
            />
          </Box>
        </>
      )}
    </SidebarCard>
  );
};
