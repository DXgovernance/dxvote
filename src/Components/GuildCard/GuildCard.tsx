import UnstyledLink from 'Components/Primitives/Links/UnstyledLink';
import { Card } from 'old-components/Guilds/common/Card/index';
import { GuildCardProps } from './types';
import GuildCardHeader from './GuildCardHeader';
import GuildCardContent from './GuildCardContent';
import { cardWrapperStyles } from './GuildCard.styled';

const GuildCard: React.FC<GuildCardProps> = ({ guildAddress }) => {
  return (
    <UnstyledLink
      data-testid="guildCard"
      to={location => `${location.pathname}/${guildAddress}`}
    >
      <Card customStyles={cardWrapperStyles}>
        <GuildCardHeader guildAddress={guildAddress} />
        <GuildCardContent guildAddress={guildAddress} />
      </Card>
    </UnstyledLink>
  );
};

export default GuildCard;
