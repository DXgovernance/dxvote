import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
import useVotingPowerPercent from 'hooks/Guilds/guild/useVotingPowerPercent';
import moment, { duration } from 'moment';
import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useTypedParams } from 'stories/Modules/Guilds/Hooks/useTypedParams';
import styled, { css } from 'styled-components';
import { useProposal } from '../../../../hooks/Guilds/ether-swr/guild/useProposal';
import { Box } from '../../common/Layout';
import SidebarCard, {
  SidebarCardContent,
  SidebarCardHeader,
} from '../../SidebarCard';
import InfoItem from './InfoItem';
import { Loading } from 'components/Guilds/common/Loading';

const Separator = styled.hr`
  margin: 1.5rem 0;
  border-color: ${({ theme }) => theme.colors.border.initial};
`;

const InfoDetail = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const InfoDetailMuted = styled.span`
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ProposalHistoryIcon = styled.span`
  cursor: pointer;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.proposalText.grey};
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  ${({ active }) =>
    active &&
    css`
      border-color: ${({ theme }) => theme.colors.border.hover};
    `}
`;

const SidebarCardContentUnpadded = styled(SidebarCardContent)`
  padding: 0;
`;

const SidebarInfoContent = styled.div`
  margin: 1.5rem;
`;

const ProposalInfoCard: React.FC = () => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const { guildId, proposalId } = useTypedParams();
  const { data: proposal, error } = useProposal(guildId, proposalId);

  const { data: guildConfig } = useGuildConfig(guildId);
  const quorum = useVotingPowerPercent(
    guildConfig?.votingPowerForProposalExecution,
    guildConfig?.totalLocked
  );

  const endDetail = useMemo(() => {
    if (!proposal || !proposal.endTime) return null;

    const currentTime = moment();
    if (proposal.endTime.isBefore(currentTime)) {
      return `Ended ${proposal.endTime.fromNow()}`;
    } else {
      return `Ends ${proposal.endTime.toNow()}`;
    }
  }, [proposal]);

  if (error) return <div>Error</div>;

  return (
    <SidebarCard header={<SidebarCardHeader>Information</SidebarCardHeader>}>
      <SidebarCardContentUnpadded>
        <SidebarInfoContent>
          <InfoDetail>
            <span>Consensus System</span>
            <InfoDetailMuted>Guild</InfoDetailMuted>
          </InfoDetail>
          <InfoDetail>
            <span>Proposal Duration</span>
            <InfoDetailMuted>
              {guildConfig?.proposalTime ? (
                duration(
                  guildConfig?.proposalTime?.toNumber(),
                  'seconds'
                ).humanize()
              ) : (
                <Loading loading text skeletonProps={{ width: '50px' }} />
              )}
            </InfoDetailMuted>
          </InfoDetail>
          <InfoDetail>
            <span>Quorum</span>
            <InfoDetailMuted>
              {quorum != null ? (
                `${quorum}%`
              ) : (
                <Loading loading text skeletonProps={{ width: '50px' }} />
              )}
            </InfoDetailMuted>
          </InfoDetail>

          <InfoDetail>
            <span>Proposal History</span>
            <ProposalHistoryIcon
              active={isHistoryExpanded}
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            >
              {isHistoryExpanded ? (
                <FiChevronUp height={16} />
              ) : (
                <FiChevronDown height={16} />
              )}
            </ProposalHistoryIcon>
          </InfoDetail>
        </SidebarInfoContent>

        {isHistoryExpanded && (
          <>
            <Separator />

            <SidebarInfoContent>
              {!proposal ? (
                <Loading loading text skeletonProps={{ height: '100px' }} />
              ) : (
                <>
                  <InfoItem
                    title="Proposal created"
                    description={proposal.startTime.format(
                      'MMM Do, YYYY - h:mm a'
                    )}
                  />
                  <InfoItem
                    title={endDetail}
                    description={proposal.endTime.format(
                      'MMM Do, YYYY - h:mm a'
                    )}
                  />
                </>
              )}
            </SidebarInfoContent>
          </>
        )}
      </SidebarCardContentUnpadded>
    </SidebarCard>
  );
};

export default ProposalInfoCard;
