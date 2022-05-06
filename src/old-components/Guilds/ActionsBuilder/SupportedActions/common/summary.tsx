import { Box } from 'old-components/Guilds/common/Layout';
import styled from 'styled-components';

export const DetailRow = styled(Box)`
  display: flex;
  margin-top: 0.75rem;
  justify-content: space-between;
  align-items: center;
`;

export const DetailCell = styled(Box)`
  display: flex;
  align-items: center;
`;

export const DetailHeader = styled(DetailRow)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: 0.75rem;
  margin-top: 0;
`;
