import styled from 'styled-components';
import { ProposalOptionTag } from '../common/ProposalOptionTag';
import ActionView from '../Action/ViewMode';
import { Detail, DetailWrapper, OptionWrapper } from './styles';
import { Option } from '../types';
import DataTag from '../common/DataTag';
import Grip from '../common/Grip';
import EditButton from '../common/EditButton';

interface OptionRowProps {
  data: Option;
}

const ActionsWrapper = styled.div`
  margin-left: 1.75rem;
`;

const OptionViewMode: React.FC<OptionRowProps> = ({ data }) => {
  return (
    <OptionWrapper>
      <DetailWrapper>
        <div>
          <Detail>
            <Grip />
          </Detail>
          <Detail>
            <ProposalOptionTag option={data} />
          </Detail>
          <Detail>
            <DataTag>
              {data?.actions?.length || 'No'} on-chain{' '}
              {data?.actions?.length >= 2 ? 'actions' : 'action'}
            </DataTag>
          </Detail>
        </div>
        <div>
          <EditButton>Edit</EditButton>
        </div>
      </DetailWrapper>

      <ActionsWrapper>
        {data?.actions?.map((action, index) => (
          <ActionView key={index} call={action} />
        ))}
      </ActionsWrapper>
    </OptionWrapper>
  );
};

export default OptionViewMode;
