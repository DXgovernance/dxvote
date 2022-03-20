import React from 'react';
import styled from 'styled-components';
import { Button } from 'components/Guilds/common/Button';
import { Input } from 'components/Guilds/common/Form';
import { AiOutlineSearch } from 'react-icons/ai';
import { useHistory, useLocation } from 'react-router';
import { Flex, Box } from 'components/Guilds/common/Layout';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import GuildCard, {
  GuildCardContent,
  GuildCardHeader,
} from 'components/Guilds/GuildCard';
import dxDaoIcon from '../../assets/images/dxdao-icon.svg';
import { Heading } from 'components/Guilds/common/Typography';
import { useGuildRegistry } from 'hooks/Guilds/ether-swr/guild/useGuildRegistry';
import { GUILDS_REGISTRY_ADDRESS } from 'constants/addresses';
import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';

const InputContainer = styled(Flex)`
  display: flex;
  flex-direction: row;
  /* Medium devices (landscape tablets, 768px and up) */
  @media only screen and (min-width: 768px) {
    grid-template-columns: 300px minmax(0, 1fr);
  }
`;

const StyledButton = styled(Button)`
  margin-left: 1rem;
  width: 9rem;
  padding: 0.7rem;
  color: ${({ theme }) => theme.colors.text};
`;
const CardContainer = styled(Flex)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 1rem;
  flex-wrap: wrap;
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

const DaoTitle = styled(Heading)`
  margin-left: 4px;
  line-height: 24px;
`;

interface TitleProps {
  guildAddress: string;
}
const Title: React.FC<TitleProps> = ({ guildAddress }) => {
  const guildName = useENSNameFromAddress(guildAddress)?.split('.')[0];
  return <DaoTitle size={2}>{guildName}</DaoTitle>;
};

const LandingPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { totalGuilds } = useGuildRegistry(GUILDS_REGISTRY_ADDRESS);
  /*TODO:
    1. Members should be dynamic
    2. Amount of proposals should be dynamic
    3. Logo should be dynamic
    */
  return (
    <>
      <InputContainer>
        <Input
          icon={<AiOutlineSearch size={24} />}
          placeholder="Search Guild"
        />
        <StyledButton
          variant="secondary"
          onClick={() => history.push(location.pathname + '/createGuild')}
          data-testid="create-guild-button"
        >
          Create Guild
        </StyledButton>
      </InputContainer>
      <CardContainer>
        {totalGuilds
          ? totalGuilds.map((guildAddress, key) => (
              <GuildCard key={key} guildAddress={guildAddress}>
                <GuildCardHeader>
                  <MemberWrapper>
                    <MdOutlinePeopleAlt size={24} />
                    500
                  </MemberWrapper>
                  <ProposalsInformation proposals={'active'}>
                    4 Proposals
                  </ProposalsInformation>
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
