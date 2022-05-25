import UnstyledLink from 'Components/Primitives/Links/UnstyledLink';
import { Card } from 'old-components/Guilds/common/Card/index';
import GuildCardHeader from './GuildCardHeader';
import GuildCardContent from './GuildCardContent';
import { cardWrapperStyles } from './styles';
import { GuildCardProps } from './types';
import { Flex } from 'Components/Primitives/Layout';

const GuildCard: React.FC<GuildCardProps> = ({
  isLoading,
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
      <Flex>
        <Card customStyles={cardWrapperStyles}>
          <GuildCardHeader
            isLoading={isLoading}
            numberOfMembers={numberOfMembers}
            t={t}
            numberOfActiveProposals={numberOfActiveProposals}
          />
          <GuildCardContent
            isLoading={isLoading}
            ensName={ensName}
            data={data}
          />
        </Card>
      </Flex>
    </UnstyledLink>
  );
};

export default GuildCard;
