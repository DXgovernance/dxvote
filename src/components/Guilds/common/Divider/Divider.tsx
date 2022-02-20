import styled from 'styled-components';

export interface DividerProps {
  style: string;
}
export const Divider = styled.div`
  width: 100%;
  min-width: 200px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.muted};
`;
