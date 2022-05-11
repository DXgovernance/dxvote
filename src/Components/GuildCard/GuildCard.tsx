import { css } from 'styled-components';
import { GuildCardProps } from './types';
import UnstyledLink from 'Components/Primitives/Links/UnstyledLink';
import { Card } from 'old-components/Guilds/common/Card/index';

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

const GuildCard: React.FC<GuildCardProps> = ({ children, guildAddress }) => {
  return (
    <UnstyledLink
      data-testId="guildCard"
      to={location => `${location.pathname}/${guildAddress}`}
    >
      <Card customStyles={cardWrapperStyles}>{children}</Card>
    </UnstyledLink>
  );
};

export default GuildCard;
