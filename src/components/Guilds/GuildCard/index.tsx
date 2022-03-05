import styled, { css } from 'styled-components';
import { Card, CardProps } from '../common/Card';
import { Box, Flex } from '../common/Layout';

const cardWrapperStyles = css`
  margin-bottom: 1rem;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
  width: 18%;
  min-width: 229px;
  height: 216px;
  padding: 24px 24px 40px 24px;
  @media (max-width: 768px) {
    flex: 1 0 auto;
    margin: 2rem;
  }
`;

const GuildCard: React.FC<CardProps> = ({ children }) => {
  return <Card customStyles={cardWrapperStyles}>{children}</Card>;
};

export default GuildCard;

export const GuildCardHeader = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text};
`;

export const GuildCardContent = styled(Box)`
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;
