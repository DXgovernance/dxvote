import styled from 'styled-components';

export const Subtitle = styled.h2`
  ${({ centered }) => centered && `text-align: center;`}
`;