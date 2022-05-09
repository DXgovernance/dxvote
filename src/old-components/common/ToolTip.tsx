import { Box } from 'Components/Primitives/Layout';
import styled from 'styled-components';

export const StyledToolTip = styled(Box)`
  @media only screen and (min-width: 768px) {
    transform: translateX(-50%);
  }
  transform: translateY(2rem);
  visibility: hidden;
  position: absolute;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.modalBackground};
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  padding: 8px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
`;
