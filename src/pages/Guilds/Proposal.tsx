import React, { useMemo } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import contentHash from 'content-hash';
import Markdown from 'markdown-to-jsx';
import Skeleton from 'react-loading-skeleton';

import { IconButton } from '../../components/Guilds/common/Button';
import { Box } from '../../components/Guilds/common/Layout';
import ProposalInfoCard from '../../components/Guilds/ProposalSidebar/ProposalInfoCard';
import ProposalVoteCard from '../../components/Guilds/ProposalSidebar/ProposalVoteCard';
import ProposalStatus from '../../components/Guilds/ProposalStatus';
import ProposalActionsCard from '../../components/Guilds/ProposalActionsCard';
import { useProposal } from '../../hooks/Guilds/proposals/useProposal';
import UnstyledLink from '../../components/Guilds/common/UnstyledLink';
import useIPFSFile from '../../hooks/Guilds/ipfs/useIPFSFile';
import { ProposalMetadata } from '../../types/types.guilds';
import AddressButton from '../../components/Guilds/AddressButton';

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

const ProposalDescription = styled.p`
  margin: 1.5rem 0;
  line-height: 1.5;
  font-size: 16px;
  text-align: justify;
`;

const StyledIconButton = styled(IconButton)`
  padding: 0;
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
  const { proposal, error } = useProposal(guildId, proposalId);

  const decodedContentHash = useMemo(() => {
    if (!proposal) return null;

    try {
      return contentHash.decode(proposal.contentHash);
    } catch (e) {
      return null;
    }
  }, [proposal]);
  const metadata = useIPFSFile<ProposalMetadata>(decodedContentHash);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <HeaderTopRow>
            <UnstyledLink to={`/${chainName}/${guildId}`}>
              <StyledIconButton variant="minimal" iconLeft>
                <FiArrowLeft /> DXdao
              </StyledIconButton>
            </UnstyledLink>

            <ProposalStatusWrapper>
              <ProposalStatus proposal={proposal} bordered hideTime />
            </ProposalStatusWrapper>
          </HeaderTopRow>
          <PageTitle>{proposal?.title || <Skeleton />}</PageTitle>
        </PageHeader>

        <AddressButton address={proposal?.creator} />

        <ProposalDescription>
          {metadata?.description ? (
            <Markdown>{metadata.description}</Markdown>
          ) : (
            <Skeleton count={10} />
          )}
        </ProposalDescription>

        <ProposalActionsWrapper>
          <ProposalActionsCard />
        </ProposalActionsWrapper>
      </PageContent>
      <SidebarContent>
        <ProposalInfoCard guildId={guildId} proposalId={proposalId} />
        <ProposalVoteCard />
      </SidebarContent>
    </PageContainer>
  );
};

export default ProposalPage;
