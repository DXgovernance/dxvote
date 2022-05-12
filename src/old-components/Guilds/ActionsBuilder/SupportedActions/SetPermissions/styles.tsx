import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout';
import { Button } from 'old-components/Guilds/common/Button';

export const ClickableIcon = styled(Box)`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const OneLineButton = styled(Button)`
  margin-left: 1rem;
  white-space: nowrap;
`;
