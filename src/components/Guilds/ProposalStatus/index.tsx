import { useMemo } from 'react';
import styled, { css } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import moment, { unix } from 'moment';

import { Box } from '../common/Layout';
import { ProposalState } from '../../../types/types.guilds.d';
import { useProposal } from 'hooks/Guilds/useProposal';
import { useParams } from 'react-router';

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
  // proposal,
  hideTime,
  showRemainingTime,
}) => {
  const { guild_id, proposal_id } = useParams<{
    guild_id?: string;
    proposal_id?: string;
  }>();

  // we need to type useProposal
  const { proposal }: any = useProposal(guild_id, proposalId || proposal_id);

  const endTime = useMemo(() => {
    if (!proposal) return null;
    return unix(proposal.endTime.toNumber());
  }, [proposal]);

  const timeDetail = useMemo(() => {
    if (!endTime || hideTime) return null;

    const currentTime = moment();
    if (endTime.isBefore(currentTime) || showRemainingTime) {
      return endTime.fromNow();
    } else {
      return endTime.toNow();
    }
  }, [endTime, showRemainingTime, hideTime]);

  const statusDetail = useMemo(() => {
    if (!proposal || !endTime) return null;

    if (proposal.state === ProposalState.Submitted) {
      const currentTime = moment();
      if (endTime.isBefore(currentTime)) {
        return 'Ended';
      } else {
        return 'Active';
      }
    }
    return 'Ended';

    // return proposal.state;
  }, [endTime, proposal]);

  return (
    <Status test-id="proposal-status" bordered={hideTime ? false : bordered}>
      {!hideTime && (
        <DetailText>
          {endTime && timeDetail ? (
            <span title={endTime?.format('MMMM Do, YYYY - h:mm a')}>
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
