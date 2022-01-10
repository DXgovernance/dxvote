import { useMemo } from 'react';
import styled, { css } from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import moment, { unix } from 'moment';

import { Box } from '../common/Layout';
import { Proposal, ProposalState } from '../../../types/types.guilds.d';

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
  proposal: Proposal;
  bordered?: boolean;
  showRemainingTime?: boolean;
}

const ProposalStatus: React.FC<ProposalStatusProps> = ({
  bordered,
  proposal,
  showRemainingTime,
}) => {
  const timeDetail = useMemo(() => {
    if (!proposal?.endTime) return null;

    const currentTime = moment();
    const timestamp = unix(proposal.endTime.toNumber());

    if (timestamp.isBefore(currentTime) || showRemainingTime) {
      return timestamp.fromNow();
    } else {
      return timestamp.toNow();
    }
  }, [proposal, showRemainingTime]);

  const statusDetail = useMemo(() => {
    if (!proposal?.state) return null;

    if (proposal.state === ProposalState.Submitted) {
      const currentTime = moment();
      const timestamp = unix(proposal.state);

      if (timestamp.isBefore(currentTime)) {
        return 'Ended';
      } else {
        return 'Active';
      }
    }

    return proposal.state;
  }, [proposal]);

  return (
    <Status bordered={bordered}>
      <DetailText>{statusDetail || <Skeleton width={50} />}</DetailText>
      <Pill filled padded>
        {timeDetail || (
          <Skeleton width={50} baseColor="#333" highlightColor="#555" />
        )}
      </Pill>
    </Status>
  );
};

export default ProposalStatus;
