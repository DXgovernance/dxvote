import styled from 'styled-components';
import { ProposalOptionTag } from './common/ProposalOptionTag';
import AddButton from './common/AddButton';
import ActionEditor from './Action/EditMode';
import { DecodedAction, Option } from './types';
import { useState } from 'react';
import ActionModal from 'components/Guilds/ActionsModal';
import Grip from './common/Grip';
import DataTag from './common/DataTag';
import EditButton from './common/EditButton';
import ActionView from './Action/ViewMode';
import { Box } from 'components/Guilds/common/Layout';

export const OptionWrapper = styled(Box)`
  padding: 1rem;
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

const ActionsWrapper = styled.div`
  margin-left: ${({ indented }) => (indented ? '1.75rem' : '0')};
`;

interface OptionRowProps {
  option: Option;
  isEditable?: boolean;
  onChange?: (updatedOption: Option) => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  isEditable,
  option,
  onChange,
}) => {
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

  return (
    <OptionWrapper>
      <DetailWrapper>
        <div>
          {isEditable && (
            <Detail>
              <Grip />
            </Detail>
          )}
          <Detail>
            <ProposalOptionTag option={option} />
          </Detail>
          <Detail>
            <DataTag>
              {option?.actions?.length || 'No'} on-chain{' '}
              {option?.actions?.length >= 2 ? 'actions' : 'action'}
            </DataTag>
          </Detail>
        </div>
        {isEditable && (
          <div>
            <EditButton>Edit</EditButton>
          </div>
        )}
      </DetailWrapper>

      <ActionsWrapper indented={isEditable}>
        {!isEditable &&
          option?.actions?.map((action, index) => (
            <ActionView key={index} call={action} isEditable={isEditable} />
          ))}

        {isEditable &&
          option?.decodedActions?.map((action, index) => (
            <ActionEditor
              key={index}
              action={action}
              onChange={updatedAction => updateAction(index, updatedAction)}
            />
          ))}

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
