import styled from 'styled-components';
import { Box } from 'components/Guilds/common/Layout';
import { ProposalOptionTag } from '../common/ProposalOptionTag';
import AddButton from '../common/AddButton';
import ActionView from '../ActionView';
import { Call, Option } from '..';
import ActionEditor from '../ActionEditor';

interface OptionRowProps {
  data: Option;
  editable: boolean;
  onChange: (updatedOption: Option) => void;
}

const ActionCountLabel = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.gray};
`;

const OptionWrapper = styled(Box)`
  padding: 1rem;
`;

const DetailWrapper = styled(Box)`
  padding: 0.5rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const OptionRow: React.FC<OptionRowProps> = ({ data, editable, onChange }) => {
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

      {!editable &&
        data?.actions?.map((action, index) => (
          <ActionView key={index} call={action} />
        ))}

      {editable &&
        data?.actions?.map((action, index) => (
          <ActionEditor
            key={index}
            call={action}
            updateCall={updatedAction => updateAction(index, updatedAction)}
          />
        ))}

      {editable && <AddButton label="Add Action" />}
    </OptionWrapper>
  );
};

export default OptionRow;
