import styled from 'styled-components';

export const Subtitle = styled.h2<{ centered?: boolean }>`
  ${({ centered }) => centered && `justify-content: center;`}
  display: flex;
  align-items: baseline;
`;
