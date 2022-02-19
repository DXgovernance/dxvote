import { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { Box } from '../Layout';

interface CardWrapperProps {
  customStyles?: string;
}
export const CardWrapper = styled<CardWrapperProps>(Box)`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  ${({ customStyles }) => customStyles}
`;

const CardHeader = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
  padding: 8px 16px;
`;
export const Header = styled.h3`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  margin: 0;
  ${({ headerStyles }) => headerStyles}
`;

export interface CardProps extends CardWrapperProps {
  header?: ReactElement | ReactElement[] | ReactNode;
  children?: ReactElement | ReactElement[] | ReactNode;
  headerStyles?: string;
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
