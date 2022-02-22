import styled, { css } from 'styled-components';
import { Card, CardProps } from '../common/Card';
import { Heading } from '../common/Typography';
import { Box } from '../common/Layout';

const cardWrapperStyles = css`
  margin-bottom: 1rem;
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
  padding-left: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const SidebarCardContent = styled(Box)`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;
