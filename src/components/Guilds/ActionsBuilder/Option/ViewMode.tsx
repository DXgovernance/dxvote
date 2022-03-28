import { ProposalOptionTag } from '../common/ProposalOptionTag';
import ActionView from '../Action/ViewMode';
import { ActionCountLabel, DetailWrapper, OptionWrapper } from './styles';
import { Option } from '../types';

interface OptionRowProps {
  data: Option;
}

const OptionViewMode: React.FC<OptionRowProps> = ({ data }) => {
  return (
    <OptionWrapper>
      <DetailWrapper>
        <ProposalOptionTag option={data} />
        <ActionCountLabel>
          {data?.actions?.length || 'No'} on-chain{' '}
          {data?.actions?.length >= 2 ? 'actions' : 'action'}
        </ActionCountLabel>
      </DetailWrapper>

      {data?.actions?.map((action, index) => (
        <ActionView key={index} call={action} />
      ))}
    </OptionWrapper>
  );
};

export default OptionViewMode;
