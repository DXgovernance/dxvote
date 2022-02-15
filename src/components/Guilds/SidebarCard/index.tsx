import { ReactElement } from 'react';
import styled from 'styled-components';
import { Box } from '../common/Layout';
import { Heading } from '../common/Typography';

const CardWrapper = styled(Box)`
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  margin-bottom: 1rem;
`;

const CardHeader = styled(Box)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
`;

interface SidebarCardProps {
  header?: ReactElement | ReactElement[];
  children?: ReactElement | ReactElement[];
}

const SidebarCard: React.FC<SidebarCardProps> = ({ header, children }) => {
  return (
    <CardWrapper>
      {header && <CardHeader>{header}</CardHeader>}
      {children}
    </CardWrapper>
  );
};

export default SidebarCard;

export const SidebarCardHeader = styled(Heading)`
  padding-left: 1rem;
  font-weight: 700;
`;

export const SidebarCardContent = styled(Box)`
  padding: 1rem;
`;
