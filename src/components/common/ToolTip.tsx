import { Box } from 'components/Guilds/common/Layout';
import styled from 'styled-components';

export const StyledToolTip = styled(Box)`
  visibility: hidden;
  position: absolute;
  transform: translate(-50%, 2rem);
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.modalBackground};
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  padding: 8px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;
