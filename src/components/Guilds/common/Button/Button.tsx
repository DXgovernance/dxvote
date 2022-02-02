import styled, { css } from 'styled-components';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'minimal';
};

const variantStyles = (variant = 'primary') =>
  ({
    primary: css`
      border: 1px solid ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding: ${({ padding }) => (padding ? padding : ' 0.5rem 0.8rem')};
      margin: ${({ margin }) => (margin ? margin : '0.2rem')};

      :hover:enabled {
        background-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.background};
      }

      :active:enabled {
        border: 1px solid ${({ theme }) => theme.colors.muted};
      }

      ${({ active, selected }) =>
        (active || selected) &&
        css`
          background-color: ${({ theme }) => theme.colors.primary};
          color: ${({ theme }) => theme.colors.background};
        `}
    `,
    secondary: css`
      border: 1px solid ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.background};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding: ${({ padding }) => (padding ? padding : ' 0.5rem 0.8rem')};
      margin: ${({ margin }) => (margin ? margin : '0.2rem')};

      :hover:enabled {
        background-color: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.text};
      }

      :active:enabled {
        border: 1px solid ${({ theme }) => theme.colors.muted};
      }

      ${({ active, selected }) =>
        (active || selected) &&
        css`
          background-color: ${({ theme }) => theme.colors.primary};
          color: ${({ theme }) => theme.colors.background};
        `}
    `,
    minimal: css`
      border: none;
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text};

      :hover: enabled {
        color: ${({ theme }) => theme.colors.muted};
      }
    `,
  }[variant]);

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.body};

  :disabled {
    color: initial;
    opacity: 0.4;
    cursor: auto;
  }

  ${({ variant }) => variantStyles(variant)}
`;

Button.defaultProps = {
  variant: 'primary',
};
