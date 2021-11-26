import styled, { css } from 'styled-components';

type HeadingProps = {
  size?: 1 | 2;
};

const sizeStyles = (size = 1) =>
  ({
    1: css`
      font-size: ${({ theme }) => theme.fontSizes.header1};
      line-height: ${({ theme }) => theme.lineHeights.header1};
      font-weight: ${({ theme }) => theme.fontWeights.regular};

      strong, b {
        font-weight: ${({ theme }) => theme.fontWeights.medium};
      }
    `,
    2: css`
      font-size: ${({ theme }) => theme.fontSizes.header2};
      line-height: ${({ theme }) => theme.lineHeights.header2};
      font-weight: ${({ theme }) => theme.fontWeights.medium};
    `,
  }[size]);

export const Heading = styled.h2<HeadingProps>`
  font-family: ${({ theme }) => theme.fonts.heading};

  ${({ size }) => sizeStyles(size)}
`;
