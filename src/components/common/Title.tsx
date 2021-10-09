import styled from 'styled-components';

export const Title = styled.h1`
  ${({ centered }) => centered && `text-align: center;`}
  ${({ noMargin }) => noMargin && `margin: 0px;`}
`;
