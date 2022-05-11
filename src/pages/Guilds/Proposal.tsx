import { useProposal } from '../../hooks/Guilds/ether-swr/guild/useProposal';
import AddressButton from '../../old-components/Guilds/AddressButton';
import ProposalDescription from '../../old-components/Guilds/ProposalPage/ProposalDescription';
import ProposalInfoCard from '../../old-components/Guilds/ProposalPage/ProposalInfoCard';
import ProposalVoteCard from '../../old-components/Guilds/ProposalPage/ProposalVoteCard';
import ProposalStatus from '../../Components/ProposalStatus/ProposalStatus';
import { IconButton } from '../../old-components/Guilds/common/Button';
import { Box } from '../../Components/Primitives/Layout';
import UnstyledLink from 'Components/Primitives/Links/UnstyledLink';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import { GuildAvailabilityContext } from 'contexts/Guilds/guildAvailability';
import { useGuildProposalIds } from 'hooks/Guilds/ether-swr/guild/useGuildProposalIds';
import useProposalCalls from 'hooks/Guilds/guild/useProposalCalls';
import { ActionsBuilder } from 'old-components/Guilds/CreateProposalPage';
import { Loading } from 'Components/Primitives/Loading';
import Result, { ResultState } from 'old-components/Guilds/common/Result';
import React, { useContext, useMemo } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import moment from 'moment';
import { ProposalState } from 'Components/Types';

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

const HeaderTopRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ProposalPage: React.FC = () => {
  const { chainName, guildId, proposalId } = useTypedParams();

  const { isLoading: isGuildAvailabilityLoading } = useContext(
    GuildAvailabilityContext
  );
  const { data: proposalIds } = useGuildProposalIds(guildId);
  const { data: proposal, error } = useProposal(guildId, proposalId);
  const { options } = useProposalCalls(guildId, proposalId);

  // TODO These are copied from ProposalCardWrapper and to be replaced
  const timeDetail = useMemo(() => {
    if (!proposal?.endTime) return null;

    const currentTime = moment();
    if (proposal.endTime?.isBefore(currentTime)) {
      return proposal.endTime.fromNow();
    } else {
      return proposal.endTime.toNow();
    }
  }, [proposal]);

  // TODO These are copied from ProposalCardWrapper and to be replaced
  const status = useMemo(() => {
    if (!proposal?.endTime) return null;
    switch (proposal.state) {
      case ProposalState.Active:
        const currentTime = moment();
        if (currentTime.isSameOrAfter(proposal.endTime)) {
          return ProposalState.Failed;
        } else {
          return ProposalState.Active;
        }
      case ProposalState.Executed:
        return ProposalState.Executed;
      case ProposalState.Passed:
        return ProposalState.Passed;
      case ProposalState.Failed:
        return ProposalState.Failed;
      default:
        return proposal.state;
    }
  }, [proposal]);

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

            <ProposalStatus
              timeDetail={timeDetail}
              status={status}
              endTime={proposal?.endTime}
            />
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
