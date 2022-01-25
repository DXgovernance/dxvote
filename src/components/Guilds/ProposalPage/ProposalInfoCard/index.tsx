import moment, { unix } from 'moment';
import React, { useMemo } from 'react';
import { FiCheck, FiInbox } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useProposal } from '../../../../hooks/Guilds/ether-swr/useProposal';
import { Box } from '../../common/Layout';
import { Heading } from '../../common/Typography';
import SidebarCard from '../../SidebarCard';
import InfoItem from './InfoItem';

const SidebarCardHeader = styled(Heading)`
  padding-left: 1rem;
`;

const SidebarCardContent = styled(Box)`
  padding: 1rem;
`;

const InfoItemLinkerLine = styled(Box)`
  border-left: 1px dashed ${({ theme }) => theme.colors.muted};
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

const ProposalInfoCard: React.FC = () => {
  const { guild_id: guildId, proposal_id: proposalId } = useParams<{
    chain_name: string;
    guild_id?: string;
    proposal_id?: string;
  }>();
  const { data: proposal, error } = useProposal(guildId, proposalId);

  const startTime = useMemo(() => {
    if (!proposal) return null;
    return unix(proposal.startTime.toNumber());
  }, [proposal]);

  const endTime = useMemo(() => {
    if (!proposal) return null;
    return unix(proposal.endTime.toNumber());
  }, [proposal]);

  const endDetail = useMemo(() => {
    if (!proposal || !endTime) return null;

    const currentTime = moment();
    if (endTime.isBefore(currentTime)) {
      return `Ended ${endTime.fromNow()}`;
    } else {
      return `Ends ${endTime.toNow()}`;
    }
  }, [endTime, proposal]);

  if (error) return <div>Error</div>;

  return (
    <SidebarCard
      header={
        <SidebarCardHeader>
          <strong>Information</strong>
        </SidebarCardHeader>
      }
    >
      <SidebarCardContent>
        {!proposal ? (
          <Skeleton />
        ) : (
          <>
            <InfoItem
              icon={<FiCheck />}
              title="Proposal created"
              description={startTime.format('MMM Do, YYYY - h:mm a')}
              link="/"
            />
            <InfoItemLinkerLine />
            <InfoItem
              icon={<FiInbox />}
              title={endDetail}
              description={endTime.format('MMM Do, YYYY - h:mm a')}
            />
          </>
        )}

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
