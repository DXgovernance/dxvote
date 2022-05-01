import { Box } from 'components/Guilds/common/Layout';
import styled from 'styled-components';

export const StyledToolTip = styled(Box)`
  visibility: hidden;
  position: absolute;
  margin-top: 2rem;
  margin-left: -10rem;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.modalBackground};
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  width: auto;
  height: auto;
  padding: 8px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;
