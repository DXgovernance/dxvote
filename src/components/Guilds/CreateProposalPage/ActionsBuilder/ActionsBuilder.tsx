import styled from 'styled-components';
import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { Header as CardHeader } from '../../common/Card';
import { Divider } from '../../common/Divider';
import { Button as CommonButton, IconButton } from '../../common/Button';
import { Flex, Box } from '../../common/Layout';
import { ProposalActionTag, ActionTypes } from '../../common/ProposalActionTag';
import SidebarCard, { SidebarCardHeaderSpaced } from 'components/Guilds/SidebarCard';

const Button = styled(CommonButton)`
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
  padding: 4px 8px;
`;

const Label = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.gray};
`;

interface ActionsBuilderProps {
  proposalViewMode?: boolean;
}

export const ActionsBuilder: React.FC<ActionsBuilderProps> = ({
  proposalViewMode,
}) => {
  const [actionsEditMode, setActionsEditMode] = useState(false);

  // TODO: remove when actions are implemented
  const [actions, setActions] = useState<any[]>([
    {
      type: 'for',
      label: 'For',
    },
    {
      type: 'against',
      label: 'Against',
    },
  ]);
  return (
    <SidebarCard
      header={
        <SidebarCardHeaderSpaced>
          <CardHeader>Actions</CardHeader>
          {proposalViewMode ? null : actionsEditMode ? (
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
          )}
        </SidebarCardHeaderSpaced>
      }
    >
      {actions.map((action, idx) => (
        <Box key={`${action.type}${idx}`}>
          <Box padding="16px">
            <Flex
              padding="8px 0"
              direction="row"
              justifyContent="space-between"
            >
              <ProposalActionTag type={action.type} />
              <Label>No on-chain action</Label>
            </Flex>

            {actionsEditMode && (
              <Box padding="8px 0">
                <IconButton margin="0" iconLeft>
                  <AiOutlinePlus /> Add Action
                </IconButton>
              </Box>
            )}
          </Box>
          {idx !== actions.length - 1 && <Divider />}
        </Box>
      ))}
      {actionsEditMode && (
        <>
          <Divider />
          <Box padding="16px">
            <IconButton
              margin="0"
              iconLeft
              onClick={() => {
                // TODO: remove this random functionality when building "add option" funcionality
                setActions(prev => [
                  ...prev,
                  {
                    type: ActionTypes[
                      [ActionTypes.for, ActionTypes.against][
                        Math.ceil(Math.random() * 2) - 1
                      ]
                    ],
                  },
                ]);
              }}
            >
              <AiOutlinePlus /> Add Option
            </IconButton>
          </Box>
        </>
      )}
    </SidebarCard>
  );
};
