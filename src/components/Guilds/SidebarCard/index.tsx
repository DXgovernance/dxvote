import { ReactElement } from 'react';
import styled from 'styled-components';
import { Box } from '../common/Layout';

const CardWrapper = styled(Box)`
  border: 1px solid #000;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const CardHeader = styled(Box)`
  border-bottom: 1px solid #000;
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
