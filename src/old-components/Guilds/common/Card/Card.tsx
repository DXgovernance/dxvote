import { ReactElement, ReactNode } from 'react';
import styled, { FlattenSimpleInterpolation } from 'styled-components';
import { Box } from '../../../../Components/Primitives/Layout';

interface CardWrapperProps {
  customStyles?: string | FlattenSimpleInterpolation;
}
export const CardWrapper = styled(Box)<CardWrapperProps>`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  ${({ customStyles }) => customStyles}
`;

const CardHeader = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
  padding: 8px 16px;
`;
export const Header = styled.h3<{ headerStyles?: any }>`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: ${({ color, theme }) => color || theme.colors.text};
  margin: 0;
  ${({ headerStyles }) => headerStyles}
`;

export interface CardProps extends CardWrapperProps {
  header?: ReactElement | ReactElement[] | ReactNode;
  children?: ReactElement | ReactElement[] | ReactNode;
  headerStyles?: string | FlattenSimpleInterpolation;
}

export const Card: React.FC<CardProps> = ({
  header,
  children,
  customStyles,
  headerStyles,
}) => {
  return (
    <CardWrapper customStyles={customStyles}>
      {header && (
        <CardHeader>
          {typeof header === 'string' ? (
            <Header headerStyles={headerStyles}>{header}</Header>
          ) : (
            header
          )}
        </CardHeader>
      )}
      <Box>{children}</Box>
    </CardWrapper>
  );
};
