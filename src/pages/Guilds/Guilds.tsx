import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

import { Box } from '../../components/Guilds/common/Layout';
import { Sidebar } from '../../components/Guilds/Sidebar';
import { Filter } from '../../components/Guilds/Filter';
import ProposalCard, {
  SkeletonProposalCard,
} from '../../components/Guilds/ProposalCard';

import useEtherSWR from 'ether-swr';
import ERC20GuildContract from '../../contracts/ERC20Guild.json';

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

  const GUILDS_CONFIG = {
    ABIs: new Map([[guildId, ERC20GuildContract.abi]]),
  };

  const {
    data: proposalsIds,
    error,
    isValidating: loading,
  } = useEtherSWR([guildId, 'getProposalsIds'], GUILDS_CONFIG);

  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        <ProposalsList data-testid="proposals-list">
          {loading && (
            <>
              <SkeletonProposalCard />
              <SkeletonProposalCard />
            </>
          )}
          {!error &&
            !loading &&
            proposalsIds.map(proposalId => (
              <ProposalCard
                id={proposalId}
                href={`/${chainName}/${guildId}/proposals/${proposalId}`}
              />
            ))}
        </ProposalsList>
        {error && <ErrorList>{error.message}</ErrorList>}
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
