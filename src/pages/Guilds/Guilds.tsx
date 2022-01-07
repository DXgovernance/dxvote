import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useEtherSWR from 'ether-swr';

import { Box } from '../../components/Guilds/common/Layout';

import { Sidebar } from '../../components/Guilds/Sidebar/';
import { Filter } from '../../components/Guilds/Filter';
import ProposalCard, {
  SkeletonProposalCard,
} from '../../components/Guilds/ProposalCard';
import { useProposals } from 'hooks/Guilds/useProposals';
import useJsonRpcProvider from '../../hooks/Guilds/web3/useJsonRpcProvider';
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
  const { guild_id: guildId } = useParams<{ guild_id?: string }>();
  const { proposals, loading, error } = useProposals(guildId);

  const provider = useJsonRpcProvider();
  const { data: loadedData, error: loadError } = useEtherSWR(['0x9cDC16b5f95229b856cBA5F38095fD8E00f8edeF', 'getProposalsIds'], {
    web3Provider: provider,
    ABIs: new Map([
      ['0x9cDC16b5f95229b856cBA5F38095fD8E00f8edeF', ERC20GuildContract.abi]
    ])
  });

  console.log('loadedData', loadedData, loadError);

  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        <ProposalsList>
          {loading && (
            <>
              <SkeletonProposalCard />
              <SkeletonProposalCard />
            </>
          )}
          {!error &&
            !loading &&
            proposals.map(proposal => (
              <ProposalCard
                title={proposal.title}
                description={proposal.contentHash}
              />
            ))}
        </ProposalsList>
        {error && <ErrorList>{error.message}</ErrorList>}
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
