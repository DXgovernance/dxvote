import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSearch } from 'react-icons/ai';
// import { MdOutlinePeopleAlt } from 'react-icons/md';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
// import useActiveProposalsNow from 'hooks/Guilds/ether-swr/guild/useGuildActiveProposals';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
// import useGuildMemberTotal from 'hooks/Guilds/ether-swr/guild/useGuildMemberTotal';
import { useGuildRegistry } from 'hooks/Guilds/ether-swr/guild/useGuildRegistry';
import GuildCard from 'Components/GuildCard/GuildCard';
import GuildCardContent from 'Components/GuildCard/GuildCardContent';
import GuildCardHeader from 'Components/GuildCard/GuildCardHeader';
import { Button } from 'old-components/Guilds/common/Button';
import Input from 'old-components/Guilds/common/Form/Input';
import { Flex } from 'Components/Primitives/Layout';
// import { Flex, Box } from 'Components/Primitives/Layout';
import { Heading } from 'old-components/Guilds/common/Typography';
import { Loading } from 'Components/Primitives/Loading';
import dxDaoIcon from '../../assets/images/dxdao-icon.svg';

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

const CardContainer = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1.7rem;
`;
// const MemberWrapper = styled(Flex)`
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
//   color: ${({ theme }) => theme.colors.card.grey};
// `;

// const ProposalsInformation = styled(Box)<{ proposals?: string }>`
//   display: inline-flex;
//   justify-content: center;
//   align-items: center;
//   margin: 0.5rem;
//   border-radius: 15px;
//   border: 1px solid
//     ${({ proposals, theme }) =>
//       proposals === 'active'
//         ? theme.colors.card.green
//         : theme.colors.card.grey};
//   background-color: ${({ theme }) => theme.colors.background};
//   color: ${({ proposals, theme }) =>
//     proposals === 'active' ? theme.colors.card.green : theme.colors.card.grey};
//   padding: 0.25rem 0.4rem;
// `;

const DaoIcon = styled.img`
  height: 4rem;
  width: 4rem;
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
const DaoTitle = styled(Heading)`
  margin-left: 4px;
  line-height: 24px;
`;

interface TitleProps {
  guildAddress: string;
}
const Title: React.FC<TitleProps> = ({ guildAddress }) => {
  const ensName = useENSNameFromAddress(guildAddress)?.split('.')[0];
  const { data } = useGuildConfig(guildAddress);
  return <DaoTitle size={2}>{ensName ?? data?.name}</DaoTitle>;
};
// const Proposals: React.FC<TitleProps> = ({ guildAddress }) => {
//   const { t } = useTranslation();
//   const { data: numberOfActiveProposals } = useActiveProposalsNow(guildAddress);
//   return (
//     <ProposalsInformation proposals={'active'}>
//       {t('proposals', {
//         count: parseInt(numberOfActiveProposals),
//       })}
//     </ProposalsInformation>
//   );
// };
// const Members: React.FC<TitleProps> = ({ guildAddress }) => {
//   const { data: numberOfMembers } = useGuildMemberTotal(guildAddress);
//   return <div>{numberOfMembers?.toString()}</div>;
// };

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
      <CardContainer>
        {error ? (
          <>{/* Render error state */}</>
        ) : isLoading ? (
          <>
            {/* Render loading state */}
            <GuildCardWithLoader guildAddress={null} />
            <GuildCardWithLoader guildAddress={null} />
            <GuildCardWithLoader guildAddress={null} />
          </>
        ) : !allGuilds.length ? (
          <>{/* Render empty state */}</>
        ) : (
          /* Render success state */
          allGuilds.map(guildAddress => (
            <GuildCardWithLoader
              key={guildAddress}
              guildAddress={guildAddress}
            />
          ))
        )}
      </CardContainer>
    </>
  );
};

function GuildCardWithLoader({ guildAddress }) {
  return (
    <GuildCard key={guildAddress} guildAddress={guildAddress}>
      <GuildCardHeader guildAddress={guildAddress} />
      <GuildCardContent>
        <DaoIcon src={dxDaoIcon} />
        {guildAddress ? (
          <Title guildAddress={guildAddress} />
        ) : (
          <Loading
            skeletonProps={{ width: 100, height: 20 }}
            style={{ marginTop: 20 }}
            text
            loading
          />
        )}
      </GuildCardContent>
    </GuildCard>
  );
}

export default LandingPage;
