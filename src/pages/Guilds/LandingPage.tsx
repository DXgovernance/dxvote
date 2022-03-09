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

const LandingPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  /*TODO:
    1. Members should be dynamic
    2. Amount of proposals should be dynamic
    3. Logo should be dynamic
    4. Name should be dynamic
    5. Should be redirected to the ENS subdomain or guildId on click
    6. Amount of guilds should be dynamic
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
        <GuildCard>
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
            <DaoTitle size={2}>DXdao</DaoTitle>
          </GuildCardContent>
        </GuildCard>
        <GuildCard>
          <GuildCardHeader>
            <MemberWrapper>
              <MdOutlinePeopleAlt size={24} />
              500
            </MemberWrapper>
            <ProposalsInformation proposals={'not-active'}>
              0 Proposals
            </ProposalsInformation>
          </GuildCardHeader>
          <GuildCardContent>
            <DaoIcon src={dxDaoIcon} />
            <DaoTitle size={2}>DXdao</DaoTitle>
          </GuildCardContent>
        </GuildCard>
        <GuildCard>
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
            <DaoTitle size={2}>DXdao</DaoTitle>
          </GuildCardContent>
        </GuildCard>
        <GuildCard>
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
            <DaoTitle size={2}>DXdao</DaoTitle>
          </GuildCardContent>
        </GuildCard>
      </CardContainer>
    </>
  );
};

export default LandingPage;
