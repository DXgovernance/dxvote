import React, { useContext } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Loading } from 'components/Guilds/common/Loading';
import { Button, IconButton } from '../../components/Guilds/common/Button';
import { Box } from '../../components/Guilds/common/Layout';
import ProposalInfoCard from '../../components/Guilds/ProposalPage/ProposalInfoCard';
import ProposalVoteCard from '../../components/Guilds/ProposalPage/ProposalVoteCard';
import ProposalStatus from '../../components/Guilds/ProposalStatus';
import UnstyledLink from '../../components/Guilds/common/UnstyledLink';
import AddressButton from '../../components/Guilds/AddressButton';
import ProposalDescription from '../../components/Guilds/ProposalPage/ProposalDescription';
import { useProposal } from '../../hooks/Guilds/ether-swr/guild/useProposal';
import { ActionsBuilder } from 'components/Guilds/CreateProposalPage';
import { GuildAvailabilityContext } from 'contexts/Guilds/guildAvailability';
import Result, { ResultState } from 'components/Guilds/common/Result';
import { useGuildProposalIds } from 'hooks/Guilds/ether-swr/guild/useGuildProposalIds';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';
import useProposalState from 'hooks/Guilds/ether-swr/guild/useProposalState';

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;

  @media only screen and (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
`;

const SidebarContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-left: 1rem;
  }
`;

const PageContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-right: 1rem;
  }
`;

const PageHeader = styled(Box)`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const PageTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;

  @media only screen and (min-width: 768px) {
    font-size: 1.4rem;
    font-weight: 700;
  }

  margin: 0;
  margin: 1rem 0;
`;

const StyledIconButton = styled(IconButton)`
  padding: 0.6rem 0.8rem;
  margin-top: 5px;
`;

const ProposalActionsWrapper = styled(Box)`
  margin-top: 2rem;
`;
const ProposalStatusWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const HeaderTopRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProposalPage: React.FC = () => {
  const {
    chain_name: chainName,
    guild_id: guildId,
    proposal_id: proposalId,
  } = useParams<{
    chain_name: string;
    guild_id?: string;
    proposal_id?: string;
  }>();

  const { isLoading: isGuildAvailabilityLoading } = useContext(
    GuildAvailabilityContext
  );
  const { data: proposalIds } = useGuildProposalIds(guildId);
  const { data: proposal, error } = useProposal(guildId, proposalId);
  const { options } = useProposalCalls(guildId, proposalId);

  const {
    data: { isExecutable, executeProposal },
  } = useProposalState();
  if (!isGuildAvailabilityLoading) {
    if (!proposalIds?.includes(proposalId)) {
      return (
        <Result
          state={ResultState.ERROR}
          title="We couldn't find that proposal."
          subtitle="It probably doesn't exist."
          extra={
            <UnstyledLink to={`/${chainName}/${guildId}`}>
              <IconButton iconLeft>
                <FiArrowLeft /> See all proposals
              </IconButton>
            </UnstyledLink>
          }
        />
      );
    } else if (error) {
      return (
        <Result
          state={ResultState.ERROR}
          title="We ran into an error."
          subtitle={error.message}
        />
      );
    }
  }

  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <HeaderTopRow>
            <UnstyledLink to={`/${chainName}/${guildId}`}>
              <StyledIconButton variant="secondary" iconLeft>
                <FaChevronLeft style={{ marginRight: '15px' }} /> DXdao
              </StyledIconButton>
            </UnstyledLink>

            <ProposalStatusWrapper>
              <ProposalStatus proposalId={proposalId} showRemainingTime />
              {isExecutable ? (
                <Button onClick={() => executeProposal()}>Execute</Button>
              ) : null}
            </ProposalStatusWrapper>
          </HeaderTopRow>
          <PageTitle>
            {proposal?.title || (
              <Loading loading text skeletonProps={{ width: '800px' }} />
            )}
          </PageTitle>
        </PageHeader>

        <AddressButton address={proposal?.creator} />

        <ProposalDescription />

        <ProposalActionsWrapper>
          <ActionsBuilder options={options} editable={false} />
        </ProposalActionsWrapper>
      </PageContent>
      <SidebarContent>
        <ProposalVoteCard />
        <ProposalInfoCard />
      </SidebarContent>
    </PageContainer>
  );
};

export default ProposalPage;
