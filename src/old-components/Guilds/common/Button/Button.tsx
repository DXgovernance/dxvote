import styled, { css } from 'styled-components';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'minimal';
  fullWidth?: boolean;
};

const variantStyles = (variant = 'primary') =>
  ({
    primary: css<{
      padding?: string;
      margin?: string;
      active?: boolean;
      selected?: boolean;
    }>`
      border: 1px solid ${({ theme }) => theme.colors.border.initial};
      background-color: ${({ theme }) => theme.colors.button.primary};
      color: ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding: ${({ padding }) => (padding ? padding : ' 0.5rem 0.8rem')};
      margin: ${({ margin }) => (margin ? margin : '0.2rem')};

      :hover:enabled {
        border-color: ${({ theme }) => theme.colors.border.hover};
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
    secondary: css<{
      padding?: string;
      margin?: string;
      active?: boolean;
      selected?: boolean;
    }>`
      border: 1px solid ${({ theme }) => theme.colors.border.initial};
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding: ${({ padding }) => (padding ? padding : ' 0.5rem 0.8rem')};
      margin: ${({ margin }) => (margin ? margin : '0.2rem')};

      :hover:enabled {
        border-color: ${({ theme }) => theme.colors.border.hover};
      }

      :active:enabled {
        border: 1px solid ${({ theme }) => theme.colors.muted};
      }
      :disabled {
        color: ${({ theme }) => theme.colors.muted};
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
  ${({ fullWidth }) =>
    css`
      width: ${fullWidth ? '100%' : 'auto'};
    `}
`;

Button.defaultProps = {
  variant: 'primary',
};
