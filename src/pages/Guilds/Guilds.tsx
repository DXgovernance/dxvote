import React from 'react';
import styled from 'styled-components';

import { Box } from '../../components/Guilds/common/Layout';

import { Sidebar } from '../../components/Guilds/Sidebar/';
import { Filter } from '../../components/Guilds/Filter';
import ProposalCard from '../../components/Guilds/ProposalCard';

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

const proposalsMock = [
  {
    title: 'DXD Buyback Program Extension #3 Proposal',
    description:
      'The DXD Buyback Program was passed by REP holders in May of this year. Since then, 6,313 DXD have been purchased on mainnet and xDai for an average price...',
  },
  {
    title: 'Proposal: SWPR single token reward campaign',
    description:
      'With the ongoing decentralized distribution of Swapr’s governance token through multi-chain liquidity mining campaigns, and while waiting for the ERC20 Guild structure to be implemented, the Swapr community has identified...',
  },
];

const GuildsPage: React.FC = () => {
  return (
    <PageContainer>
      <SidebarContent>
        <Sidebar />
      </SidebarContent>
      <PageContent>
        <Filter />
        <ProposalsList>
          {proposalsMock.map(proposal => (
            <ProposalCard
              title={proposal.title}
              description={proposal.description}
            />
          ))}
        </ProposalsList>
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
