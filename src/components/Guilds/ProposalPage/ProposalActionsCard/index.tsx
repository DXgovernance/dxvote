import styled from 'styled-components';
import { Heading } from '../../common/Typography';
import SidebarCard from '../../SidebarCard';
import ActionItem from './ActionItem';

const ProposalCardHeader = styled(Heading)`
  padding-left: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ProposalActionsCard = () => {
  return (
    <SidebarCard
      header={
        <ProposalCardHeader>
          <strong>Actions</strong>
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
