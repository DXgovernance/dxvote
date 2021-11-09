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

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
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
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  margin: 0.1rem 0 1rem 0;
`;

const PageSubtitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 400;
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

const GuildsPage: React.FC = () => {
  return (
    <PageContainer>
      <Sidebar />
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
          
        </ProposalsList>
      </PageContent>
    </PageContainer>
  );
};

export default GuildsPage;
