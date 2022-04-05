import { ProposalOptionTag } from '../common/ProposalOptionTag';
import AddButton from '../common/AddButton';
import ActionEditor from '../Action/EditMode';
import { ActionCountLabel, DetailWrapper, OptionWrapper } from './styles';
import { DecodedAction, Option } from '../types';
import { useState } from 'react';
import ActionModal from 'components/Guilds/ActionsModal';

interface OptionRowProps {
  option: Option;
  onChange?: (updatedOption: Option) => void;
}

const OptionEditMode: React.FC<OptionRowProps> = ({ option, onChange }) => {
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
        <ProposalOptionTag option={option} />
        <ActionCountLabel>
          {option?.actions?.length || 'No'} on-chain{' '}
          {option?.actions?.length > 2 ? 'actions' : 'action'}
        </ActionCountLabel>
      </DetailWrapper>

      {option?.decodedActions?.map((action, index) => (
        <ActionEditor
          key={index}
          action={action}
          onChange={updatedAction => updateAction(index, updatedAction)}
        />
      ))}

      <AddButton
        label="Add Action"
        onClick={() => setIsActionsModalOpen(true)}
      />

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

export default OptionEditMode;
