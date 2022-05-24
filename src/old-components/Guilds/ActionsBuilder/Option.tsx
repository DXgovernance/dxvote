import ActionRow from './Action';
import AddButton from './common/AddButton';
import DataTag from './common/DataTag';
import EditButton from './common/EditButton';
import Grip from './common/Grip';
import { ProposalOptionTag } from './common/ProposalOptionTag';
import { DecodedAction, Option } from './types';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionModal } from 'Components/ActionsModal';
import { Box } from 'Components/Primitives/Layout';
import { useState } from 'react';
import styled from 'styled-components';

export const OptionWrapper = styled(Box)<{ dragging: boolean }>`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 1rem;
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({ dragging, theme }) =>
    dragging ? theme.colors.text : 'transparent'};
  z-index: ${({ dragging }) => (dragging ? 999 : 'initial')};
  box-shadow: ${({ dragging }) =>
    dragging ? '0px 4px 8px 0px rgba(0, 0, 0, 0.2)' : 'none'};
`;

export const DetailWrapper = styled(Box)`
  padding: 0.5rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export const Detail = styled(Box)`
  display: inline-flex;
  margin-right: 0.75rem;
`;

const ActionsWrapper = styled.div<{ indented?: boolean }>`
  margin-left: ${({ indented }) => (indented ? '1.75rem' : '0')};
`;

interface OptionRowProps {
  option: Option;
  isEditable?: boolean;
  onChange?: (updatedOption: Option) => void;
  editOption: (option: Option) => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  isEditable,
  option,
  onChange,
  editOption,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: option.id });
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  function addAction(action: DecodedAction) {
    onChange({
      ...option,
      decodedActions: [...option.decodedActions, action],
    });
  }

  function updateAction(index: number, action: DecodedAction) {
    const updatedActions = option?.decodedActions.map((a, i) =>
      index === i ? action : a
    );
    onChange({ ...option, decodedActions: updatedActions });
  }

  const dndStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <OptionWrapper
      dragging={isDragging}
      ref={setNodeRef}
      style={dndStyles}
      {...attributes}
    >
      <DetailWrapper>
        <div>
          {isEditable && (
            <Detail {...listeners}>
              <Grip />
            </Detail>
          )}
          <Detail>
            <ProposalOptionTag option={option} />
          </Detail>
          <Detail>
            <DataTag>
              {option?.decodedActions?.length || 'No'} on-chain{' '}
              {option?.decodedActions?.length >= 2 ? 'actions' : 'action'}
            </DataTag>
          </Detail>
        </div>
        {isEditable && (
          <div>
            <EditButton onClick={() => editOption(option)}>Edit</EditButton>
          </div>
        )}
      </DetailWrapper>

      <ActionsWrapper indented={isEditable}>
        {!isEditable &&
          option?.actions?.map((action, index) => (
            <ActionRow key={index} call={action} isEditable={false} />
          ))}

        {isEditable && (
          <SortableContext
            items={option?.decodedActions?.map(action => action.id)}
            strategy={verticalListSortingStrategy}
          >
            {option?.decodedActions?.map((action, index) => {
              return (
                <ActionRow
                  key={index}
                  isEditable={true}
                  decodedAction={action}
                  onEdit={updatedAction => updateAction(index, updatedAction)}
                />
              );
            })}
          </SortableContext>
        )}

        {isEditable && (
          <AddButton
            label="Add Action"
            onClick={() => setIsActionsModalOpen(true)}
          />
        )}
      </ActionsWrapper>

      <ActionModal
        isOpen={isActionsModalOpen}
        setIsOpen={setIsActionsModalOpen}
        onAddAction={action => {
          addAction(action);
          setIsActionsModalOpen(false);
        }}
      />
    </OptionWrapper>
  );
};

export default OptionRow;
