import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
import styled, { css } from 'styled-components';
import { Card, CardProps } from '../common/Card';
import { Box, Flex } from '../common/Layout';
import { Link } from 'react-router-dom';

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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

interface GuildCardProps extends CardProps {
  guildAddress: string;
}

const GuildCard: React.FC<GuildCardProps> = ({ children, guildAddress }) => {
  const ensName = useENSNameFromAddress(guildAddress)?.split('.')[0];
  return (
    <StyledLink to={location => `${location.pathname}/${ensName}`}>
      <Card customStyles={cardWrapperStyles}>{children}</Card>
    </StyledLink>
  );
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
