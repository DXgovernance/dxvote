import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Button } from 'components/Guilds/common/Button';
import Input from 'components/Guilds/common/Form/Input';
import { AiOutlineSearch } from 'react-icons/ai';
import { Flex, Box } from 'components/Guilds/common/Layout';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import GuildCard, {
  GuildCardContent,
  GuildCardHeader,
} from 'components/Guilds/GuildCard';
import dxDaoIcon from '../../assets/images/dxdao-icon.svg';
import { Heading } from 'components/Guilds/common/Typography';
import { useGuildRegistry } from 'hooks/Guilds/ether-swr/guild/useGuildRegistry';
import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
import { Link } from 'react-router-dom';
import { getChains } from 'provider/connectors';
import { useWeb3React } from '@web3-react/core';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
import useActiveProposalsNow from 'hooks/Guilds/ether-swr/guild/useGuildActiveProposals';
import useGuildMemberTotal from 'hooks/Guilds/ether-swr/guild/useGuildMemberTotal';

const configs = {
  arbitrum: require('configs/arbitrum/config.json'),
  arbitrumTestnet: require('configs/arbitrumTestnet/config.json'),
  mainnet: require('configs/mainnet/config.json'),
  xdai: require('configs/xdai/config.json'),
  rinkeby: require('configs/rinkeby/config.json'),
  localhost: require('configs/localhost/config.json'),
};

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
const MemberWrapper = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.card.grey};
`;

const ProposalsInformation = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
  border-radius: 15px;
  border: 1px solid
    ${({ proposals, theme }) =>
      proposals === 'active'
        ? theme.colors.card.green
        : theme.colors.card.grey};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ proposals, theme }) =>
    proposals === 'active' ? theme.colors.card.green : theme.colors.card.grey};
  padding: 0.25rem 0.4rem;
`;

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
const Proposals: React.FC<TitleProps> = ({ guildAddress }) => {
  const { t } = useTranslation();
  const { data: numberOfActiveProposals } = useActiveProposalsNow(guildAddress);
  return (
    <ProposalsInformation proposals={'active'}>
      {t('proposals', {
        count: parseInt(numberOfActiveProposals),
      })}
    </ProposalsInformation>
  );
};
const Members: React.FC<TitleProps> = ({ guildAddress }) => {
  const { data: numberOfMembers } = useGuildMemberTotal(guildAddress);
  return <div>{numberOfMembers?.toString()}</div>;
};

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const chainName =
    getChains().find(chain => chain.id === chainId)?.name || null;

  const { data: allGuilds } = useGuildRegistry(
    configs[chainName].contracts.utils.guildRegistry
  );

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
        {allGuilds
          ? allGuilds.map(guildAddress => (
              <GuildCard key={guildAddress} guildAddress={guildAddress}>
                <GuildCardHeader>
                  <MemberWrapper>
                    <MdOutlinePeopleAlt size={24} />
                    <Members guildAddress={guildAddress} />
                  </MemberWrapper>
                  <Proposals guildAddress={guildAddress} />
                </GuildCardHeader>
                <GuildCardContent>
                  <DaoIcon src={dxDaoIcon} />
                  <Title guildAddress={guildAddress} />
                </GuildCardContent>
              </GuildCard>
            ))
          : null}
      </CardContainer>
    </>
  );
};

export default LandingPage;
