import styled from 'styled-components';
import { Heading } from '../../common/Typography';
import SidebarCard from '../../SidebarCard';
import ActionItem from './ActionItem';

const ProposalCardHeader = styled(Heading)`
  padding-left: 1rem;
`;

const ProposalActionsCard = () => {
  return (
    <SidebarCard
      header={
        <ProposalCardHeader>
          <strong>Details</strong>
        </ProposalCardHeader>
      }
    >
      <ActionItem />
      <ActionItem />
      <ActionItem />
    </SidebarCard>
  );
};

export default ProposalActionsCard;
