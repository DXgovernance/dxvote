import styled from 'styled-components';
import { Box, Flex } from 'components/Guilds/common/Layout';
import { ProposalOptionTag } from '../ProposalOptionTag';
import AddButton from '../AddButton';
import ActionView, { Action } from '../Action';

export interface Option {
  index: number;
  label: string;
  actions?: Action[];
}

interface OptionRowProps {
  data: Option;
  editable: boolean;
}

const ActionCountLabel = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.gray};
`;

const OptionRow: React.FC<OptionRowProps> = ({ data, editable }) => {
  return (
    <Box padding="16px">
      <Flex padding="8px 0" direction="row" justifyContent="space-between">
        <ProposalOptionTag option={data} />
        <ActionCountLabel>
          {data?.actions?.length || 'No'} on-chain{' '}
          {data?.actions?.length > 2 ? 'actions' : 'action'}
        </ActionCountLabel>
      </Flex>

      {!editable &&
        data?.actions?.map((action, index) => (
          <ActionView key={index} action={action} />
        ))}

      {editable && <AddButton label="Add Action" />}
    </Box>
  );
};

export default OptionRow;
