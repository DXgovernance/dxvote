import styled from 'styled-components';
import { FaFlagCheckered } from 'react-icons/fa';
import { useVotes } from 'hooks/Guilds/useVotes';
import useVotingPowerPercent from 'hooks/Guilds/guild/useVotingPowerPercent';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import Skeleton from 'react-loading-skeleton';
import { Flex } from '../Layout';

const VotesChartContainer = styled.div`
  display: flex;
  position: relative;
  flex: 1;
  flex-direction: column;
  margin: 10px 0px 40px 0px;
  width: 100%;
`;

const VotesChartRow = styled.div`
  display: flex;
  flex: 1;
  height: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.pill};
  background-color: ${({ theme }) => theme.colors.muted};
  overflow: hidden;
`;

const VoteFill = styled.div`
  width: ${({ fill }) => (fill ? `${fill}%` : '')};
  background: ${({ type, theme }) => theme.colors.votes[type]};
  height: 0.75rem;
  overflow: hidden;
`;

// The margin top and height are different when quorum 0 or 100,
// becase the border radious of the container, the marker needs to touch the curved line.
const VoteQuorumMarker = styled.div`
  height: ${({ quorum }) => (quorum === 0 || quorum === 100 ? '18px' : '14px')};
  margin-top: ${({ quorum }) =>
    quorum === 0 || quorum === 100 ? '10px' : '14px'};
  width: 1px;
  background: ${({ theme }) => theme.colors.muted};
`;

const VoteQuorumLabel = styled.div`
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ quorum, theme }) =>
    quorum < 10
      ? `0px ${theme.radii.pill} ${theme.radii.pill}`
      : quorum > 90
      ? `${theme.radii.pill} 0px ${theme.radii.pill} ${theme.radii.pill}`
      : `${theme.radii.pill}`};
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  align-items: center;
  display: flex;

  span {
    margin-left: 2px;
  }
`;

// If quorum <10, we align to left the marker and label, and left position of container is quorum.
// if 10 < quorum < 90, we left position the container at the quorum - the half of the width of the label, centered flex.
// quorum > 90, we align the container at the quorum - the full width of the label, right alignment label and marker.
const VoteQuorumContainer = styled.div`
  width: 65px;
  position: absolute;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: ${({ quorum }) =>
    quorum < 10 ? 'flex-start' : quorum > 90 ? 'flex-end' : 'center'};
  left: ${({ quorum }) =>
    quorum < 10
      ? `${quorum}%`
      : quorum > 90
      ? `calc(${quorum}% - 65px)`
      : `calc(${quorum}% - 22px)`};
`;

const SkeletonAction = styled(Flex)`
  flex-direction: row;
  justify-content: space-between;
  margin: 2px 0;
`;

const ActionsContainer = styled.div`
  margin: 8px 0;
`;

const PaddedFlagCheckered = styled(FaFlagCheckered)`
  margin-right: 0.4rem;
`;

//TODO: rewrite css dynamics types
export const VotesChart = ({ showToken, token }) => {
  const { voteData } = useVotes();

  const nQuorum = useBigNumberToNumber(
    voteData?.quorum,
    voteData?.token?.decimals
  );

  const flagCheckered = useVotingPowerPercent(
    voteData?.quorum,
    voteData?.totalLocked
  );

  return (
    <VotesChartContainer>
      {voteData.args ? (
        <>
          <VotesChartRow>
            {Object.values(voteData.args).map((item, i) => {
              return <VoteFill fill={item[i][1]} type={i} />;
            })}
          </VotesChartRow>
          <VoteQuorumContainer quorum={flagCheckered}>
            <VoteQuorumMarker quorum={flagCheckered} />
            <VoteQuorumLabel quorum={flagCheckered}>
              <PaddedFlagCheckered />
              <span>{showToken ? nQuorum : flagCheckered}</span>
              <span>{showToken ? token : '%'}</span>
            </VoteQuorumLabel>
          </VoteQuorumContainer>
        </>
      ) : (
        <>
          <ActionsContainer>
            <SkeletonAction>
              <Skeleton width={50} />
              <Skeleton width={50} />
            </SkeletonAction>
            <SkeletonAction>
              <Skeleton width={50} />
              <Skeleton width={50} />
            </SkeletonAction>
          </ActionsContainer>
          <Skeleton height={20} />
        </>
      )}
    </VotesChartContainer>
  );
};
