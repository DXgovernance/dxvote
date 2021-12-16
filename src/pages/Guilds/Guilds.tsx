import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { Box } from '../../components/Guilds/common/Layout';

import { Sidebar } from '../../components/Guilds/Sidebar/';
import { Filter } from '../../components/Guilds/Filter';
import ProposalCard from '../../components/Guilds/ProposalCard';
import { useProposals } from 'hooks/Guilds/useProposals';
import PendingCircle from 'components/common/PendingCircle';

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;

  /* Medium devices (landscape tablets, 768px and up) */
  @media only screen and (min-width: 768px) {
    grid-template-columns: 300px minmax(0, 1fr);
  }
`;

const SidebarContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-right: 0.5rem;
  }
`;

const PageContent = styled(Box)`
  @media only screen and (min-width: 768px) {
    margin-left: 0.5rem;
  }
`;

const ProposalsList = styled(Box)`
  margin-top: 1rem;
`;

const GuildsPage: React.FC = () => {
  const { guild_id: guildId } = useParams<{ guild_id?: string}>();
  const { proposals, loading, error } = useProposals(guildId);
  console.debug('Guilds Proposals: ', proposals, loading, error);

  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        {loading && (
          <PendingCircle height="100px" width="100px" color="black" />
        )}
        <ProposalsList>
          {!loading &&
            !error &&
            proposals.map(proposal => (
              <ProposalCard
                title={proposal.title}
                description={proposal.contentHash}
              />
            ))}
        </ProposalsList>
        {error && <div>{error.message}</div>}
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
