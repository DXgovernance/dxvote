import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
import { useHistory, useLocation } from 'react-router-dom';
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

interface GuildCardProps extends CardProps {
  guildAddress: string;
}

const GuildCard: React.FC<GuildCardProps> = ({ children, guildAddress }) => {
  const history = useHistory();
  const location = useLocation();
  const ensName = useENSNameFromAddress(guildAddress)?.split('.')[0];

  return (
    <Card
      customStyles={cardWrapperStyles}
      onClick={() => history.push(`${location.pathname}/${ensName}`)}
    >
      {children}
    </Card>
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
