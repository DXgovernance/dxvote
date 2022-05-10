import { useGuildProposalIds } from '../../hooks/Guilds/ether-swr/guild/useGuildProposalIds';
import { Filter } from '../../old-components/Guilds/Filter';
import { Sidebar } from '../../old-components/Guilds/Sidebar';
import { Box } from '../../Components/Primitives/Layout';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import ProposalCardWrapper from 'Modules/Guilds/Wrappers/ProposalCardWrapper';
import { GuildAvailabilityContext } from 'contexts/Guilds/guildAvailability';
import Result, { ResultState } from 'old-components/Guilds/common/Result';
import React, { useContext, useMemo } from 'react';
import InView from 'react-intersection-observer';
import styled from 'styled-components';

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
  const { guildId } = useTypedParams();
  const { data: proposalIds, error } = useGuildProposalIds(guildId);
  const { isLoading } = useContext(GuildAvailabilityContext);
  const filteredProposalIds = useMemo(() => {
    if (!proposalIds) return null;

    // clone array as the original proposalIds array from Ethers is immutable
    const clone = [...proposalIds];

    // TODO: Implement filtering

    // Show latest proposals first
    return clone.reverse();
  }, [proposalIds]);

  if (!isLoading && !proposalIds && error) {
    return (
      <Result
        state={ResultState.ERROR}
        title="We ran into an error."
        subtitle={error.message}
      />
    );
  }

  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        <ProposalsList data-testid="proposals-list">
          {filteredProposalIds ? (
            filteredProposalIds.map(proposalId => (
              <InView key={proposalId}>
                {({ inView, ref }) => (
                  <div ref={ref}>
                    <ProposalCardWrapper
                      proposalId={inView ? proposalId : null}
                    />
                  </div>
                )}
              </InView>
            ))
          ) : (
            <>
              <ProposalCardWrapper />
              <ProposalCardWrapper />
              <ProposalCardWrapper />
              <ProposalCardWrapper />
              <ProposalCardWrapper />
            </>
          )}
        </ProposalsList>
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
