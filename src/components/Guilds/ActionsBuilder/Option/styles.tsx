import styled from 'styled-components';
import { Box } from 'components/Guilds/common/Layout';

export const ActionCountLabel = styled.span`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.gray};
`;

export const OptionWrapper = styled(Box)`
  padding: 1rem;
`;

export const DetailWrapper = styled(Box)`
  padding: 0.5rem 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
