import React from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

import {
  DropdownButton,
  DropdownContent,
  DropdownMenu,
  DropdownPosition,
} from '../../components/Guilds/common/DropdownMenu';
import { Box } from '../../components/Guilds/common/Layout';
import { Menu, MenuItem } from '../../components/Guilds/common/Menu';
import Sidebar from '../../components/Guilds/Sidebar';
import ProposalCard from '../../components/Guilds/ProposalCard';

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
`;

const SidebarContent = styled(Box)`
  margin-right: 0.5rem;
`;

const PageContent = styled(Box)`
  margin-left: 0.5rem;
`;

const PageHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const PageTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  margin: 0.1rem 0 1rem 0;
`;

const PageSubtitle = styled.h4`
  font-weight: 500;
  margin: 0;
`;

const DropdownMenuItem = styled(MenuItem)`
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
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
        <PageHeader>
          <Box>
            <PageSubtitle>DXdao</PageSubtitle>
            <PageTitle>Proposals</PageTitle>
          </Box>
          <DropdownMenu position={DropdownPosition.BottomRight}>
            <DropdownButton iconRight>
              Sort by <FiChevronDown />
            </DropdownButton>
            <DropdownContent>
              <Menu>
                <DropdownMenuItem>Newest</DropdownMenuItem>
                <DropdownMenuItem>Oldest</DropdownMenuItem>
                <DropdownMenuItem>Most voted</DropdownMenuItem>
                <DropdownMenuItem>Least voted</DropdownMenuItem>
              </Menu>
            </DropdownContent>
          </DropdownMenu>
        </PageHeader>

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
