import styled from 'styled-components';
import { Flex } from 'Components/Primitives/Layout/index';

const GuildCardHeader = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
`;

export default GuildCardHeader;
