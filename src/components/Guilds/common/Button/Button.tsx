import styled, { css } from 'styled-components';

type ButtonProps = {
  variant?: 'primary' | 'minimal';
};

const variantStyles = (variant = 'primary') =>
  ({
    primary: css`
      border: 0.1rem solid ${({ theme }) => theme.colors.primary};
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding: 0.5rem 0.8rem;
      margin: 0.2rem;

      :hover:enabled {
        background-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.background};
      }

      :active:enabled {
        border: 0.1rem solid ${({ theme }) => theme.colors.muted};
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

      :hover:enabled {
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
