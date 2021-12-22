import styled, { css } from 'styled-components';

export const Badge = styled.div`
  border-radius: ${({ theme }) => theme.radii.badge};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  padding: 2px 5px;
  font-size: 10px;

  /* use reverse prop when willing inverse colors based on parent status */
  ${({ reverse }) =>
    reverse &&
    css`
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    `}
`;
