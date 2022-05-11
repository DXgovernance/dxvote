import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout/index';

const GuildCardContent = styled(Box)`
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

export default GuildCardContent;
