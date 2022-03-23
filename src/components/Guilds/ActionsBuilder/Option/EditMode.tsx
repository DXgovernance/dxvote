import { ProposalOptionTag } from '../common/ProposalOptionTag';
import AddButton from '../common/AddButton';
import ActionEditor from '../Action/EditMode';
import { ActionCountLabel, DetailWrapper, OptionWrapper } from './styles';
import { Call, Option } from '../types';

interface OptionRowProps {
  data: Option;
  onChange?: (updatedOption: Option) => void;
}

const OptionEditMode: React.FC<OptionRowProps> = ({ data, onChange }) => {
  function updateAction(index: number, action: Call) {
    const updatedActions = data?.actions.map((a, i) =>
      index === i ? action : a
    );
    onChange({ ...data, actions: updatedActions });
  }

  return (
    <OptionWrapper>
      <DetailWrapper>
        <ProposalOptionTag option={data} />
        <ActionCountLabel>
          {data?.actions?.length || 'No'} on-chain{' '}
          {data?.actions?.length > 2 ? 'actions' : 'action'}
        </ActionCountLabel>
      </DetailWrapper>

      {data?.actions?.map((action, index) => (
        <ActionEditor
          key={index}
          call={action}
          updateCall={updatedAction => updateAction(index, updatedAction)}
        />
      ))}

      <AddButton label="Add Action" />
    </OptionWrapper>
  );
};

export default OptionEditMode;
