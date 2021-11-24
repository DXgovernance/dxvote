import styled from 'styled-components';
import { Box } from '../common/Layout';
import ProposalInfoCard from './ProposalInfoCard';
import ProposalVoteCard from './ProposalVoteCard';

const SidebarWrapper = styled(Box)``;

const ProposalSidebar = () => {
  return (
    <SidebarWrapper>
      <ProposalInfoCard />
      <ProposalVoteCard />
    </SidebarWrapper>
  );
};

export default ProposalSidebar;
