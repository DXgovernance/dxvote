import styled, { css } from 'styled-components';
import { Flex } from '.';

type ContainerTextProps = {
  variant?: 'regular' | 'medium' | 'bold';
};

const variantStyles = (variant = 'regular') =>
  ({
    regular: css`
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
    `,
    medium: css`
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
    `,

    bold: css`
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
    `,
  }[variant]);

export const ContainerText = styled(Flex)<ContainerTextProps>`
  font-family: Inter;
  margin: 4px;
  font-style: normal;
  color: ${props => props.color || '#000000'};
  ${({ variant }) => variantStyles(variant)}
`;

ContainerText.defaultProps = {
  variant: 'regular',
};
