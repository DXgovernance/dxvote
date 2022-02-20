import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { Box } from '../../components/Guilds/common/Layout';
import { Sidebar } from '../../components/Guilds/Sidebar';
import { Filter } from '../../components/Guilds/Filter';
import ProposalCard from '../../components/Guilds/ProposalCard';
import InView from 'react-intersection-observer';
import { useGuildProposalIds } from '../../hooks/Guilds/ether-swr/guild/useGuildProposalIds';

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

const ErrorList = styled(Box)`
  overflow: hidden;
`;

const GuildsPage: React.FC = () => {
  const { chain_name: chainName, guild_id: guildId } =
    useParams<{ chain_name?: string; guild_id?: string }>();
  const { data: proposalIds, error } = useGuildProposalIds(guildId);
  const filteredProposalIds = useMemo(() => {
    if (!proposalIds) return null;

    // clone array as the original proposalIds array from Ethers is immutable
    const clone = [...proposalIds];

    // TODO: Implement filtering

    // Show latest proposals first
    return clone.reverse();
  }, [proposalIds]);

  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        {!error ? (
          <ProposalsList data-testid="proposals-list">
            {filteredProposalIds ? (
              filteredProposalIds.map(proposalId => (
                <InView key={proposalId}>
                  {({ inView, ref }) => (
                    <div ref={ref}>
                      <ProposalCard
                        id={inView ? proposalId : null}
                        href={`/${chainName}/${guildId}/proposal/${proposalId}`}
                      />
                    </div>
                  )}
                </InView>
              ))
            ) : (
              <>
                <ProposalCard />
                <ProposalCard />
                <ProposalCard />
                <ProposalCard />
                <ProposalCard />
              </>
            )}
          </ProposalsList>
        ) : (
          <ErrorList>{error.message}</ErrorList>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
