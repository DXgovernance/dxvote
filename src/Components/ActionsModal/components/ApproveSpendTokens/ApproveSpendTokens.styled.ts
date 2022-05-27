import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout';

export const ControlRow = styled(Box)`
  display: flex;
  align-items: stretch;
  height: 100%;
`;
export const Control = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.75rem 0;
  width: 100%;
`;

export const ControlLabel = styled(Box)`
  margin-bottom: 0.75rem;
`;

export const Spacer = styled(Box)`
  margin-right: 1rem;
`;
