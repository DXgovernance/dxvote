import React from 'react';
import styled from 'styled-components';
import { FiChevronLeft } from 'react-icons/fi';
import { MdOutlinePreview } from 'react-icons/md';
import { Box, Flex } from '../../components/Guilds/common/Layout';
import { IconButton } from '../../components/Guilds/common/Button';
import { InputText } from '../../components/Guilds/common/Form';
import SidebarCard from '../../components/Guilds/SidebarCard';
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

const Button = styled(IconButton)`
  margin: 0;
`;

const Input = styled(InputText)`
  display: block;
  margin: 0;
  width: -webkit-fill-available;
`;

const SidebarHeader = styled.h3`
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: #000000;
  padding: 16px;
  margin: 0;
`;

const Label = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  color: ${({ color }) => (color ? color : `#000000`)};
  margin-bottom: 0.5rem;
`;

const CreateProposalPage: React.FC = () => {
  return (
    <PageContainer>
      <PageContent>
        <Flex
          direction="row"
          justifyContent="space-between"
          margin="0px 0px 24px"
        >
          <Button iconLeft>
            <FiChevronLeft />
            Back to Overview
          </Button>

          <Button padding="8px">
            <MdOutlinePreview size={18} />
          </Button>
        </Flex>
        <Box margin="0px 0px 24px">
          <Label> Title</Label>
          <Input placeholder="Proposal Title" />
        </Box>
        <Box margin="0px 0px 24px">
          <Label color="#A1A6B0"> Reference link (optional)</Label>
          <Input placeholder="https://daotalk.org/..." />
        </Box>
        <Editor onChange={console.log} />
      </PageContent>
      <SidebarContent>
        <SidebarCard header={<SidebarHeader>Information</SidebarHeader>}>
          <Box padding="12px 0">
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Consensus System</Label>
              <Label> Guild</Label>
            </Flex>
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Proposal Duration</Label>
              <Label> 8 days</Label>
            </Flex>
            <Flex
              direction="row"
              justifyContent="space-between"
              padding="5px 16px"
            >
              <Label> Quorum</Label>
              <Label> 40%</Label>
            </Flex>
          </Box>
        </SidebarCard>
      </SidebarContent>
    </PageContainer>
  );
};

export default CreateProposalPage;
