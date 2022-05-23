import styled from 'styled-components';

export const Title = styled.h1<{ centered?: boolean; noMargin?: boolean }>`
  ${({ centered }) => centered && `text-align: center;`}
  ${({ noMargin }) => noMargin && `margin: 0px;`}
`;
