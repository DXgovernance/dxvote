import styled from 'styled-components';

export const Badge = styled.div`
  border-radius: ${({ theme }) => theme.radii.badge};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 5px;
  font-size: 10px;
`;
