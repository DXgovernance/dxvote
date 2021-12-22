import styled, { css } from 'styled-components';

export const Badge = styled.div`
  border-radius: ${({ theme }) => theme.radii.badge};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  width: ${({ size }) => (size ? `${size}px` : '20px')};
  height: ${({ size }) => (size ? `${size}px` : '20px')};
  font-size: inherit;
  display: flex;
  align-items: center;
  justify-content: center;

  /* use reverse prop when willing inverse colors based on parent status */
  ${({ reverse }) =>
    reverse &&
    css`
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    `}
`;
