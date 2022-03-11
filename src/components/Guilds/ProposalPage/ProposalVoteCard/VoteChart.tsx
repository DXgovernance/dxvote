import styled, { useTheme } from 'styled-components';
import { FaFlagCheckered } from 'react-icons/fa';
import useVotingPowerPercent from 'hooks/Guilds/guild/useVotingPowerPercent';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { Loading } from '../../common/Loading';
import { useVotingResults } from 'hooks/Guilds/ether-swr/guild/useVotingResults';

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

const ChartBar = styled.div`
  width: ${({ percent }) => (percent ? `${percent}%` : '')};
  background: ${({ color }) => color};
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

const PaddedFlagCheckered = styled(FaFlagCheckered)`
  margin-right: 0.4rem;
`;

//TODO: rewrite css dynamics types
export const VotesChart = ({ isPercent }) => {
  const voteData = useVotingResults();
  const theme = useTheme();

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
      {voteData?.options ? (
        <VotesChartRow>
          {Object.values(voteData.options).map((item, i) => {
            const percentBN = item
              .mul(100)
              .mul(Math.pow(10, 2))
              .div(voteData?.totalLocked);
            const percent = Math.round(percentBN.toNumber()) / Math.pow(10, 2);

            return (
              <ChartBar percent={percent} color={theme?.colors?.votes?.[i]} />
            );
          })}
        </VotesChartRow>
      ) : (
        <Loading loading text skeletonProps={{ height: 24, count: 2 }} />
      )}
      {voteData && (
        <VoteQuorumContainer quorum={flagCheckered}>
          <VoteQuorumMarker quorum={flagCheckered} />
          <VoteQuorumLabel quorum={flagCheckered}>
            <PaddedFlagCheckered />
            <span>{isPercent ? nQuorum : flagCheckered}</span>
            <span>{isPercent ? voteData?.token?.symbol : '%'}</span>
          </VoteQuorumLabel>
        </VoteQuorumContainer>
      )}
    </VotesChartContainer>
  );
};
