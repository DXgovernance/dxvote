import UnstyledLink from 'Components/Primitives/Links/UnstyledLink';
import { Card } from 'old-components/Guilds/common/Card/index';
// import { GuildCardProps } from './types';
import GuildCardHeader from './GuildCardHeader';
import GuildCardContent from './GuildCardContent';
import { cardWrapperStyles } from './GuildCard.styled';

interface GuildCardProps {
  guildAddress: string;
  numberOfMembers: any;
  t: any;
  numberOfActiveProposals: any;
  ensName: string;
  data: any;
}

const GuildCard: React.FC<GuildCardProps> = ({
  guildAddress,
  numberOfMembers,
  t,
  numberOfActiveProposals,
  ensName,
  data,
}) => {
  return (
    <UnstyledLink
      data-testid="guildCard"
      to={location => `${location.pathname}/${guildAddress}`}
    >
      <Card customStyles={cardWrapperStyles}>
        <GuildCardHeader
          guildAddress={guildAddress}
          numberOfMembers={numberOfMembers}
          t={t}
          numberOfActiveProposals={numberOfActiveProposals}
        />
        <GuildCardContent
          guildAddress={guildAddress}
          ensName={ensName}
          data={data}
        />
      </Card>
    </UnstyledLink>
  );
};

export default GuildCard;
