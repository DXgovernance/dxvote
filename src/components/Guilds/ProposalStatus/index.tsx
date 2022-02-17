import { useMemo } from 'react';
import styled, { css } from 'styled-components';
import moment from 'moment';

import { Box } from '../common/Layout';
import { ProposalState } from '../../../types/types.guilds.d';
import { useParams } from 'react-router';
import { useProposal } from '../../../hooks/Guilds/ether-swr/useProposal';
import { Loading } from '../common/Loading';

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

const ProposalStatusDetail = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
  border-radius: 15px;
  border: 1px solid
    ${props =>
    props.statusDetail === ProposalState.Failed ? '#D500F9' : '#1DE9B6'};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${props =>
    props.statusDetail === ProposalState.Failed ? '#D500F9' : '#1DE9B6'};
  padding: 0.25rem 0.4rem;
`;

const DetailText = styled(Box)`
padding: 0 0.2rem;

@media only screen and(min - width: 768px) {
  padding - right: 0.5rem;
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
    switch (proposal.state) {
      case ProposalState.Active:
        const currentTime = moment();
        if (currentTime.isSameOrAfter(proposal.endTime)) {
          return ProposalState.Failed;
        } else {
          return ProposalState.Active
        }
      case ProposalState.Executed:
        return ProposalState.Executed;
      case ProposalState.Passed:
        return ProposalState.Passed;
      case ProposalState.Failed:
        return ProposalState.Failed;
      default:
        return proposal.state;
    }
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
            <Loading test-id="skeleton" loading text skeletonProps={{ width: '50px' }} />
          )}
        </DetailText>
      )}
      {statusDetail ? <ProposalStatusDetail statusDetail={statusDetail}> {statusDetail}</ProposalStatusDetail> :
        (
          <Loading
            test-id="skeleton"
            loading
            text
            skeletonProps={{ width: '50px' }}
          />
        )}
    </Status>
  );
};

export default ProposalStatus;
