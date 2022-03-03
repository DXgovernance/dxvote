import styled from 'styled-components';
import { Box, Flex } from 'components/Guilds/common/Layout';
import { ProposalOptionTag } from '../ProposalOptionTag';
import AddButton from '../AddButton';

export interface Option {
  index: number;
  label: string;
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
        <ActionCountLabel>No on-chain action</ActionCountLabel>
      </Flex>

      {editable && <AddButton label="Add Action" />}
    </Box>
  );
};

export default OptionRow;
