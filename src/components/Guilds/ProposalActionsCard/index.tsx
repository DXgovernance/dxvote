import styled from 'styled-components';
import { Box } from '../common/Layout';
import SidebarCard from '../SidebarCard';
import ActionItem from './ActionItem';

const ProposalCardHeader = styled(Box)`
  padding: 1rem;
  font-weight: 600;
`;

const ProposalActionsCard = () => {
  return (
    <SidebarCard header={<ProposalCardHeader>Details</ProposalCardHeader>}>
      <ActionItem />
      <ActionItem />
      <ActionItem />
    </SidebarCard>
  );
};

export default ProposalActionsCard;
