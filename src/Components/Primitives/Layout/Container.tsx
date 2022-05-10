import styled from 'styled-components';
import { Box } from '.';

export const Container = styled(Box)`
  width: 1200px;
  max-width: calc(100% - 1.25rem);
  margin: 0 auto;
  @media only screen and (min-width: 768px) {
    padding: 3rem 0rem;
  }
`;
