import styled from 'styled-components';
import { Box } from '../Layout';

export const Menu = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: 0.5rem;
`;

export const MenuItem = styled.a`
  display: block;
  text-decoration: none;
  color: initial;
  padding: 0.5rem 1rem;
`;
