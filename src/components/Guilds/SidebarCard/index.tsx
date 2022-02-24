import styled, { css } from 'styled-components';
import { Card, CardProps } from '../common/Card';
import { Heading } from '../common/Typography';
import { Box } from '../common/Layout';

const cardWrapperStyles = css`
  margin-bottom: 1rem;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
`;

const SidebarCard: React.FC<CardProps> = ({ header, children }) => {
  return (
    <Card header={header} customStyles={cardWrapperStyles}>
      {children}
    </Card>
  );
};

export default SidebarCard;

export const SidebarCardHeader = styled(Heading)`
  font-weight: 600;
  margin: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const SidebarCardContent = styled(Box)`
  padding: 1rem;
`;
