import { FiCheck, FiInbox } from 'react-icons/fi';
import styled from 'styled-components';
import { Box } from '../../common/Layout';
import SidebarCard from '../../SidebarCard';
import InfoItem from './InfoItem';

const SidebarCardHeader = styled(Box)`
  padding: 1rem;
  font-weight: 600;
`;

const SidebarCardContent = styled(Box)`
  padding: 1rem;
`;

const InfoItemLinkerLine = styled(Box)`
  border-left: 1px dashed #000;
  height: 1.5rem;
  position: relative;
  left: 1rem;
`;

const Separator = styled.hr`
  margin: 1.5rem 0;
`;

const UserInfoDetail = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  width: 100%;
  font-weight: 600;
`;

const ProposalInfoCard = () => {
  return (
    <SidebarCard header={<SidebarCardHeader>Information</SidebarCardHeader>}>
      <SidebarCardContent>
        <InfoItem
          icon={<FiCheck />}
          title="Proposal created"
          description="March 31rd, 2021 - 2:32 am"
          link="/"
        />
        <InfoItemLinkerLine />
        <InfoItem
          icon={<FiInbox />}
          title="Ends in 43 days"
          description="March 31rd, 2021 - 2:32 am"
        />

        <Separator />

        <UserInfoDetail>
          <span>Voting System</span>
          <span>Holographic</span>
        </UserInfoDetail>
        <UserInfoDetail>
          <span>Quorum</span>
          <span>40%</span>
        </UserInfoDetail>
      </SidebarCardContent>
    </SidebarCard>
  );
};

export default ProposalInfoCard;
