import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import styled from 'styled-components';
import { IconButton } from '../../components/Guilds/common/Button';
import { Box } from '../../components/Guilds/common/Layout';
import ProposalSidebar from '../../components/Guilds/ProposalSidebar';
import ProposalStatus from '../../components/Guilds/ProposalStatus';
import dxIcon from '../../assets/images/dxdao-icon.svg';
import ProposalActionsCard from '../../components/Guilds/ProposalActionsCard';

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

const ButtonIcon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const StyledIconButton = styled(IconButton)`
  padding: 0;
  margin-top: 5px;
`;

const ProposalActionsWrapper = styled(Box)`
  margin-top: 2rem;
`;

const ProposalPage: React.FC = () => {
  return (
    <PageContainer>
      <PageContent>
        <PageHeader>
          <StyledIconButton variant="minimal" iconLeft>
            <FiArrowLeft /> DXdao
          </StyledIconButton>
          <PageTitle>DXLisbon Contributor Stipend and Funds</PageTitle>
          <ProposalStatus bordered status="Active" detail="Ends in 34 days" />
        </PageHeader>

        <ProposalDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed leo quam,
          blandit eu sapien eu, commodo dapibus nisl. Phasellus id risus in
          mauris pharetra tristique. Pellentesque euismod at velit a auctor.
          Quisque ipsum odio, molestie maximus dignissim sit amet, rutrum id
          tortor. Mauris non dolor turpis. Duis ut pharetra ex. Pellentesque
          dignissim quis tellus eget mattis. Nunc tellus augue, dignissim nec
          fermentum ac, euismod vel nunc. Fusce mi justo, facilisis eu dui
          tincidunt, tristique aliquet dolor. Ut rhoncus velit a orci maximus
          dapibus. Proin vulputate sem et ipsum sagittis, in fermentum lacus
          auctor. Mauris dictum mi ante, sed condimentum leo tincidunt non. Ut
          gravida libero accumsan magna dapibus tristique ut convallis ipsum.
          Mauris congue odio et imperdiet ullamcorper.
        </ProposalDescription>

        <IconButton iconLeft>
          <ButtonIcon src={dxIcon} alt={'Icon'} />
          geronimo.eth
        </IconButton>

        <ProposalActionsWrapper>
          <ProposalActionsCard />
        </ProposalActionsWrapper>
      </PageContent>
      <SidebarContent>
        <ProposalSidebar />
      </SidebarContent>
    </PageContainer>
  );
};

export default ProposalPage;
