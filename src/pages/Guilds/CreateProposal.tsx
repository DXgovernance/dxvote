import React from 'react';
import styled from 'styled-components';
import { Box } from '../../components/Guilds/common/Layout';
import Editor from 'components/Guilds/Editor';

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
const CreateProposalPage: React.FC = () => {
  return (
    <PageContainer>
      <PageContent>
        <Editor />
      </PageContent>
      <SidebarContent></SidebarContent>
    </PageContainer>
  );
};

export default CreateProposalPage;
