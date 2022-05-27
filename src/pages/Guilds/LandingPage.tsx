import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSearch } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGuildRegistry } from 'hooks/Guilds/ether-swr/guild/useGuildRegistry';
import GuildCard from 'Components/GuildCard/GuildCard';
import { Button } from 'old-components/Guilds/common/Button';
import Input from 'old-components/Guilds/common/Form/Input';
import { Flex } from 'Components/Primitives/Layout';

import useGuildMemberTotal from 'hooks/Guilds/ether-swr/guild/useGuildMemberTotal';
import useActiveProposalsNow from 'hooks/Guilds/ether-swr/guild/useGuildActiveProposals';
import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';

const InputContainer = styled(Flex)`
  flex-direction: row;
  /* Medium devices (landscape tablets, 768px and up) */
  @media only screen and (min-width: 768px) {
    grid-template-columns: 300px minmax(0, 1fr);
  }
`;

const StyledButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
  margin-left: 1rem;
  width: 9rem;
  padding: 0.7rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CardsContainer = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1.7rem;
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

const GuildCardLoader = () => {
  return (
    <GuildCard
      isLoading={true}
      guildAddress={null}
      numberOfMembers={null}
      t={null}
      numberOfActiveProposals={null}
      ensName={null}
      data={null}
    />
  );
};

const GuildCardWithContent = ({ guildAddress, t }) => {
  const { data: numberOfMembers } = useGuildMemberTotal(guildAddress);
  const { data: numberOfActiveProposals } = useActiveProposalsNow(guildAddress);
  const ensName = useENSNameFromAddress(guildAddress)?.split('.')[0];
  const { data } = useGuildConfig(guildAddress);

  return (
    <GuildCard
      guildAddress={guildAddress}
      numberOfMembers={numberOfMembers}
      t={t}
      numberOfActiveProposals={numberOfActiveProposals}
      ensName={ensName}
      data={data}
    />
  );
};

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: allGuilds, error } = useGuildRegistry();

  const isLoading = !allGuilds && !error;

  return (
    <>
      <InputContainer>
        <Input
          value=""
          icon={<AiOutlineSearch size={24} />}
          placeholder="Search Guild"
        />
        <StyledButton data-testid="create-guild-button">
          {' '}
          <StyledLink to={location => `${location.pathname}/createGuild`}>
            {t('guilds.create')}
          </StyledLink>
        </StyledButton>
      </InputContainer>
      <CardsContainer>
        {error ? (
          <>{/* Render error state */}</>
        ) : isLoading ? (
          <>
            {/* Render loading state */}
            <GuildCardLoader />
            <GuildCardLoader />
            <GuildCardLoader />
          </>
        ) : !allGuilds.length ? (
          <>{/* Render empty state */}</>
        ) : (
          /* Render success state */
          allGuilds.map(guildAddress => (
            <GuildCardWithContent
              key={guildAddress}
              guildAddress={guildAddress}
              t={t}
            />
          ))
        )}
      </CardsContainer>
    </>
  );
};

export default LandingPage;
