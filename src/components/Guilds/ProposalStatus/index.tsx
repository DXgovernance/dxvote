import { useMemo } from 'react';
import styled, { css } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';

import { Box } from '../common/Layout';
import { ProposalState } from '../../../types/types.guilds.d';
import { useParams } from 'react-router';
import { useProposal } from '../../../hooks/Guilds/ether-swr/useProposal';

const Status = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ bordered }) =>
    bordered &&
    css`
      border: 1px solid ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding-left: 0.5rem;
    `}
`;

const Pill = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  border-radius: 1.5rem;
  padding: ${props => (props.padded ? '0.5rem 0.8rem' : '0')};
  color: ${props =>
    props.filled ? props.theme.colors.background : props.theme.colors.text};
  background-color: ${props =>
    props.filled ? props.theme.colors.text : 'transparent'};
  border: 1px solid ${({ theme }) => theme.colors.text};
`;

const DetailText = styled(Box)`
  padding: 0 0.2rem;

  @media only screen and (min-width: 768px) {
    padding-right: 0.5rem;
  }
`;

interface ProposalStatusProps {
  //optional cause
  //if not present can { guild_id, proposal_id } = useParams()
  proposalId?: string;
  // proposal: Proposal;
  bordered?: boolean;
  hideTime?: boolean;
  showRemainingTime?: boolean;
}

const ProposalStatus: React.FC<ProposalStatusProps> = ({
  proposalId,
  bordered,
  hideTime,
  showRemainingTime,
}) => {
  const { guild_id, proposal_id: paramProposalId } = useParams<{
    guild_id?: string;
    proposal_id?: string;
  }>();

  const { data: proposal } = useProposal(
    guild_id,
    proposalId || paramProposalId
  );

  const timeDetail = useMemo(() => {
    if (!proposal?.endTime || hideTime) return null;

    const currentTime = moment();
    if (proposal.endTime?.isBefore(currentTime) || showRemainingTime) {
      return proposal.endTime.fromNow();
    } else {
      return proposal.endTime.toNow();
    }
  }, [proposal, showRemainingTime, hideTime]);

  const statusDetail = useMemo(() => {
    if (!proposal?.endTime) return null;

    if (proposal.state === ProposalState.Submitted) {
      const currentTime = moment();
      if (currentTime.isSameOrAfter(proposal.endTime)) {
        return 'Ended';
      } else {
        return 'Active';
      }
    }

    return proposal.state;
  }, [proposal]);

  return (
    <Status test-id="proposal-status" bordered={hideTime ? false : bordered}>
      {!hideTime && (
        <DetailText>
          {proposal?.endTime && timeDetail ? (
            <span title={proposal.endTime?.format('MMMM Do, YYYY - h:mm a')}>
              {timeDetail}
            </span>
          ) : (
            <Skeleton test-id="skeleton" width={50} />
          )}
        </DetailText>
      )}
      <Pill filled padded>
        {statusDetail || (
          <Skeleton
            test-id="skeleton"
            width={50}
            baseColor="#333"
            highlightColor="#555"
          />
        )}
      </Pill>
    </Status>
  );
};

export default ProposalStatus;
